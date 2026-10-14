<?php

namespace App\Http\Controllers;

use App\Jobs\SendOrderExcelMail;
use App\Models\Address;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Support\AdminNotifier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    private const GST_RATE = 0.18;

    /**
     * POST /orders   (public: works for guests and logged-in users)
     * Called when the customer clicks "Pay". Creates the order as "pending" (prices are
     * calculated here from the database, never trusted from the browser), then opens a
     * Razorpay order for that exact amount.
     *
     * Account handling:
     *  - logged in            -> order belongs to that user
     *  - guest, email known   -> order is linked to the existing account
     *  - guest, email new     -> an account row is created from the checkout form
     *
     * IMPORTANT: this method NEVER returns a login token. Typing an email proves nothing,
     * so a guest can only see order history / profile after verifying the email with the
     * OTP code (/auth/verify-code is the only place a token is issued).
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'shipping'              => 'required|array',
            'shipping.firstName'    => 'required|string',
            'shipping.lastName'     => 'required|string',
            'shipping.email'        => 'required|email',
            'shipping.mobile'       => 'required|string',
            'shipping.country'      => 'required|string',
            'shipping.city'         => 'required|string',
            'shipping.pincode'      => 'required|string',
            'items'                 => 'required|array|min:1',
            'items.*.product_id'    => 'required|integer|exists:products,id',
            'items.*.quantity'      => 'required|integer|min:1',
        ]);

        $shipping = $request->shipping;

        // ── prices from the database ─────────────────────────────────────
        $quantities = collect($request->items)
            ->groupBy('product_id')
            ->map(fn ($rows) => (int) $rows->sum('quantity'));

        $products = Product::whereIn('id', $quantities->keys())
            ->where('status', 'active')
            ->get()
            ->keyBy('id');

        if ($products->count() !== $quantities->count()) {
            return response()->json(['message' => 'One or more reports are no longer available.'], 422);
        }

        $subtotalExact = 0.0;
        $lines = [];
        foreach ($quantities as $productId => $qty) {
            $price = (float) $products[$productId]->price;
            $subtotalExact += $price * $qty;
            $lines[] = ['product_id' => $productId, 'quantity' => $qty, 'price' => $price];
        }

        $taxExact = $subtotalExact * self::GST_RATE;
        $subtotal = (int) round($subtotalExact);
        $tax      = (int) round($taxExact);
        $total    = (int) round($subtotalExact + $taxExact);

        // ── who owns this order? (no token is ever issued here) ──────────
        $userId = $this->resolveUserId($shipping);

        // remember this address for next time (skipped if the customer already has it)
        $this->rememberAddress($userId, $shipping);

        // ── create the order (pending) ───────────────────────────────────
        $order = DB::transaction(function () use ($shipping, $lines, $subtotal, $tax, $total, $userId) {
            $order = Order::create([
                'user_id'         => $userId,
                'customer_name'   => trim($shipping['firstName'] . ' ' . $shipping['lastName']),
                'customer_email'  => $shipping['email'],
                'customer_mobile' => $shipping['mobile'],
                'country'         => $shipping['country'],
                'state'           => $shipping['state']   ?? null,
                'city'            => $shipping['city'],
                'pincode'         => $shipping['pincode'],
                'address'         => $shipping['address'] ?? null,
                'subtotal'        => $subtotal,
                'tax'             => $tax,
                'total'           => $total,
                'status'          => 'pending',
            ]);

            foreach ($lines as $line) {
                $order->items()->create($line);
            }

            return $order;
        });

        // ── free order: nothing to pay, complete it now ──────────────────
        if ($total === 0) {
            $order->update([
                'status'              => 'paid',
                'razorpay_payment_id' => 'free_' . Str::random(12),
                'paid_at'             => now(),
            ]);
            SendOrderExcelMail::dispatchAfterResponse($order);   // after the response, so checkout isn't slowed
            AdminNotifier::order($order);                         // tell sales

            return response()->json(['order_id' => $order->id, 'paid' => true], 201);
        }

        // ── open the order at Razorpay ───────────────────────────────────
        $key    = config('services.razorpay.key');
        $secret = config('services.razorpay.secret');

        if (!$key || !$secret) {
            Log::error('Razorpay keys are missing (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET).');
            $order->update(['status' => 'failed', 'failure_reason' => 'Payment gateway is not configured']);
            return response()->json(['message' => 'Payments are temporarily unavailable.'], 500);
        }

        try {
            $res = Http::withBasicAuth($key, $secret)
                ->acceptJson()
                ->timeout(20)
                ->post('https://api.razorpay.com/v1/orders', [
                    'amount'   => $total * 100,            // paise
                    'currency' => 'INR',
                    'receipt'  => 'ORD-' . $order->id,
                    'notes'    => ['order_id' => (string) $order->id],
                ]);
        } catch (\Throwable $e) {
            report($e);
            $order->update(['status' => 'failed', 'failure_reason' => 'Could not reach the payment gateway']);
            return response()->json(['message' => 'Could not start the payment. Please try again.'], 502);
        }

        if ($res->failed() || !$res->json('id')) {
            Log::error('Razorpay order creation failed', ['body' => $res->body()]);
            $order->update(['status' => 'failed', 'failure_reason' => 'Payment gateway rejected the order']);
            return response()->json(['message' => 'Could not start the payment. Please try again.'], 502);
        }

        $order->update(['razorpay_order_id' => $res->json('id')]);

        return response()->json([
            'order_id'          => $order->id,
            'razorpay_order_id' => $res->json('id'),
            'amount'            => $total * 100,
            'currency'          => 'INR',
            'key'               => $key,
            'paid'              => false,
        ], 201);
    }

    /**
     * Logged in -> that user. Guest -> find the account by email, or create one.
     * Returns the user id only. No token is created here, ever: the owner of the email
     * claims the account later by signing in with the emailed OTP code.
     */
    private function resolveUserId(array $shipping): int
    {
        $authId = Auth::guard('sanctum')->id();
        if ($authId) {
            return (int) $authId;
        }

        $email = strtolower(trim($shipping['email']));

        $user = User::where('email', $email)->first();

        if (!$user) {
            $user = User::create([
                'name'          => trim($shipping['firstName'] . ' ' . $shipping['lastName']),
                'email'         => $email,
                'mobile_number' => $shipping['mobile'],
                'password'      => Hash::make(Str::random(32)),   // never used (passwordless)
                'is_verified'   => 0,
            ]);
        } elseif (empty($user->mobile_number)) {
            $user->update(['mobile_number' => $shipping['mobile']]);
        }

        return (int) $user->id;
    }

    /**
     * Save the checkout address on the customer's account, once.
     * Same address typed again (ignoring case / spaces) is not saved twice.
     * The first address a customer ever saves becomes their default.
     */
    private function rememberAddress(int $userId, array $shipping): void
    {
        $norm = fn ($v) => mb_strtolower(trim((string) ($v ?? '')));

        $exists = Address::where('user_id', $userId)->get()->contains(function ($a) use ($norm, $shipping) {
            return $norm($a->first_name) === $norm($shipping['firstName'])
                && $norm($a->last_name)  === $norm($shipping['lastName'])
                && $norm($a->mobile)     === $norm($shipping['mobile'])
                && $norm($a->country)    === $norm($shipping['country'])
                && $norm($a->state)      === $norm($shipping['state'] ?? '')
                && $norm($a->city)       === $norm($shipping['city'])
                && $norm($a->pincode)    === $norm($shipping['pincode'])
                && $norm($a->address)    === $norm($shipping['address'] ?? '');
        });

        if ($exists) {
            return;
        }

        Address::create([
            'user_id'    => $userId,
            'first_name' => trim($shipping['firstName']),
            'last_name'  => trim($shipping['lastName']),
            'mobile'     => trim($shipping['mobile']),
            'country'    => $shipping['country'],
            'state'      => $shipping['state'] ?? null,
            'city'       => trim($shipping['city']),
            'pincode'    => trim($shipping['pincode']),
            'address'    => isset($shipping['address']) ? trim($shipping['address']) : null,
            'is_default' => !Address::where('user_id', $userId)->exists(),
        ]);
    }

    /**
     * POST /orders/verify
     * Called by the browser after Razorpay reports a successful payment.
     * The signature proves the payment is real, so only now is the order marked paid
     * and the reports emailed.
     */
    public function verify(Request $request): JsonResponse
    {
        $data = $request->validate([
            'razorpay_order_id'   => 'required|string',
            'razorpay_payment_id' => 'required|string',
            'razorpay_signature'  => 'required|string',
        ]);

        $order = Order::where('razorpay_order_id', $data['razorpay_order_id'])->firstOrFail();

        $expected = hash_hmac(
            'sha256',
            $data['razorpay_order_id'] . '|' . $data['razorpay_payment_id'],
            (string) config('services.razorpay.secret')
        );

        if (!hash_equals($expected, $data['razorpay_signature'])) {
            Log::warning('Razorpay signature mismatch', ['order_id' => $order->id]);
            return response()->json(['message' => 'Payment could not be verified.'], 400);
        }

        // lock the row so a double call can't send the email twice
        $justPaid = DB::transaction(function () use ($order, $data) {
            $locked = Order::lockForUpdate()->find($order->id);
            if ($locked->status === 'paid') {
                return false;
            }
            $locked->update([
                'status'              => 'paid',
                'razorpay_payment_id' => $data['razorpay_payment_id'],
                'failure_reason'      => null,
                'paid_at'             => now(),
            ]);
            return true;
        });

        if ($justPaid) {
            $paidOrder = $order->fresh();
            SendOrderExcelMail::dispatchAfterResponse($paidOrder);   // after the response, so the customer isn't kept waiting
            AdminNotifier::order($paidOrder);                         // tell sales (once, thanks to the lock above)
        }

        return response()->json(['message' => 'Payment confirmed.', 'order_id' => $order->id]);
    }

    /**
     * POST /orders/fail
     * Called when the customer closes the Razorpay window or a payment attempt fails.
     * A paid order is never downgraded.
     */
    public function fail(Request $request): JsonResponse
    {
        $data = $request->validate([
            'razorpay_order_id'   => 'required|string',
            'reason'              => 'nullable|string|max:250',
            'razorpay_payment_id' => 'nullable|string|max:100',
        ]);

        $order = Order::where('razorpay_order_id', $data['razorpay_order_id'])->firstOrFail();

        if ($order->status !== 'paid') {
            $order->update([
                'status'              => 'failed',
                'failure_reason'      => $data['reason'] ?? 'Payment not completed',
                'razorpay_payment_id' => $data['razorpay_payment_id'] ?? $order->razorpay_payment_id,
            ]);
        }

        return response()->json(['message' => 'Recorded.']);
    }

    /**
     * GET /orders   ADMIN ONLY: lists every customer's orders.
     * Customers use GET /my-orders (MyOrderController), which is scoped to the signed-in user.
     * Protect the route in routes/api.php (see the reply), otherwise anyone can open it.
     */
    public function index(Request $request): JsonResponse
    {
        $status = $request->query('status');

        $query = Order::with(['items.product.images'])->latest();

        // Filter by status if provided (pending | paid | failed)
        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        // Paginate results (10 per page)
        $orders = $query->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $orders->items(),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'total' => $orders->total(),
                'per_page' => $orders->perPage(),
            ]
        ]);
    }
}
<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use App\Traits\ResolvesCart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CartController extends Controller
{
    use ResolvesCart;

    /**
     * Decides whose cart this request is about.
     * Declared here on purpose: a method in the class overrides the one in the
     * ResolvesCart trait, so cart lookup no longer depends on the trait.
     * The cart routes are public, so the Sanctum guard is asked explicitly.
     */
    protected function getOrCreateCart(Request $request): Cart
    {
        $user      = $request->user('sanctum');       // null for guests
        $sessionId = $request->header('X-Session-Id');

        // TEMP debug - check storage/logs/laravel.log, then delete this line
        Log::info('CART owner', [
            'route'      => $request->path(),
            'user_id'    => $user?->id,
            'session_id' => $sessionId,
            'has_bearer' => (bool) $request->bearerToken(),
        ]);

        if ($user) {
            return Cart::firstOrCreate(['user_id' => $user->id]);
        }

        abort_if(!$sessionId, 422, 'Missing X-Session-Id header.');

        return Cart::firstOrCreate(['session_id' => $sessionId, 'user_id' => null]);
    }

    // GET /cart
    public function index(Request $request)
    {
        $cart = $this->getOrCreateCart($request);
        return response()->json($this->cartSummary($cart));
    }

    // POST /cart
    public function add(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity'   => 'integer|min:1',
        ]);

        $cart = $this->getOrCreateCart($request);

        $item = $cart->items()->firstOrCreate(
            ['product_id' => $request->product_id],
            ['quantity'   => 0]
        );
        $item->increment('quantity', (int) ($request->quantity ?? 1));
        $item->load('product.images');

        return response()->json(['data' => $item], 201);
    }

    // PUT /cart/{cartItem}
    public function update(Request $request, CartItem $cartItem)
    {
        $request->validate(['quantity' => 'required|integer|min:0']);
        $this->assertOwnsItem($request, $cartItem);

        if ((int) $request->quantity === 0) {
            $cartItem->delete();
        } else {
            $cartItem->update(['quantity' => (int) $request->quantity]);
        }

        return response()->json(['message' => 'Updated']);
    }

    // DELETE /cart/{cartItem}
    public function remove(Request $request, CartItem $cartItem)
    {
        $this->assertOwnsItem($request, $cartItem);
        $cartItem->delete();

        return response()->json(['message' => 'Removed']);
    }

    // DELETE /cart/clear
    public function clear(Request $request)
    {
        $cart = $this->getOrCreateCart($request);
        $cart->items()->delete();

        return response()->json(['message' => 'Cart cleared']);
    }

    // POST /cart/merge  (called right after login; route is inside auth:sanctum)
    public function merge(Request $request)
    {
        // session_id is optional: a user who logs in with no guest cart still works
        $request->validate(['session_id' => 'nullable|string']);

        $userCart = Cart::firstOrCreate(['user_id' => $request->user()->id]);

        if ($request->filled('session_id')) {
            $guestCart = Cart::where('session_id', $request->session_id)
                ->whereNull('user_id')
                ->first();

            if ($guestCart) {
                foreach ($guestCart->items as $guestItem) {
                    $existing = $userCart->items()
                        ->where('product_id', $guestItem->product_id)
                        ->first();

                    if ($existing) {
                        $existing->increment('quantity', $guestItem->quantity);
                    } else {
                        $userCart->items()->create([
                            'product_id' => $guestItem->product_id,
                            'quantity'   => $guestItem->quantity,
                        ]);
                    }
                }
                $guestCart->items()->delete();
                $guestCart->delete();
            }
        }

        return response()->json($this->cartSummary($userCart));
    }

    // A cart item may only be changed by the owner of the cart it belongs to
    private function assertOwnsItem(Request $request, CartItem $cartItem): void
    {
        $cart = $this->getOrCreateCart($request);
        abort_unless($cartItem->cart_id === $cart->id, 403, 'This item is not in your cart.');
    }
}
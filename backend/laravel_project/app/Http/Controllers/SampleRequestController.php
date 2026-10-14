<?php

namespace App\Http\Controllers;

use App\Mail\SampleRequestMail;
use App\Models\Product;
use App\Models\SampleRequest;
use App\Models\User;
use App\Support\AdminNotifier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class SampleRequestController extends Controller
{
    // GET /api/sample-requests?page=1&search=abc&account=all|registered|new   (admin list)
    public function index(Request $request): JsonResponse
    {
        $search  = trim((string) $request->query('search', ''));
        $account = $request->query('account', 'all');

        // Only verified accounts count as "registered" (sign-ups that never entered the OTP don't)
        $verifiedEmails = fn () => User::where('is_verified', 1)->select('email');

        $paginator = SampleRequest::with('product:id,name,code,slug')
            ->when($search !== '', function ($q) use ($search) {
                $q->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('mobile', 'like', "%{$search}%")
                      ->orWhere('company', 'like', "%{$search}%")
                      ->orWhereHas('product', fn ($p) => $p->where('name', 'like', "%{$search}%"));
                });
            })
            ->when($account === 'registered', fn ($q) => $q->whereIn('email', $verifiedEmails()))
            ->when($account === 'new',        fn ($q) => $q->whereNotIn('email', $verifiedEmails()))
            ->latest()
            ->paginate(15);

        // Look up the users for this page in one query
        $emails = collect($paginator->items())->pluck('email')->unique()->values();
        $users  = User::where('is_verified', 1)
            ->whereIn('email', $emails)
            ->get(['id', 'name', 'email'])
            ->keyBy(fn ($u) => strtolower($u->email));

        $data = collect($paginator->items())->map(function ($row) use ($users) {
            $user = $users->get(strtolower($row->email));

            return array_merge($row->toArray(), [
                'is_registered' => (bool) $user,
                'user'          => $user ? ['id' => $user->id, 'name' => $user->name] : null,
            ]);
        });

        return response()->json([
            'data' => $data,
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'total'        => $paginator->total(),
                'per_page'     => $paginator->perPage(),
            ],
        ]);
    }

    // DELETE /api/sample-requests/{sampleRequest}   (admin: delete one)
    public function destroy(SampleRequest $sampleRequest): JsonResponse
    {
        $sampleRequest->delete();

        return response()->json(['message' => 'Sample request deleted.']);
    }

    // POST /api/sample-requests/bulk-delete   body: { "ids": [1, 2, 3] }   (admin: delete the ticked rows)
    public function bulkDestroy(Request $request): JsonResponse
    {
        $data = $request->validate([
            'ids'   => ['required', 'array', 'min:1', 'max:500'],
            'ids.*' => ['integer'],
        ]);

        $deleted = SampleRequest::whereIn('id', $data['ids'])->delete();

        return response()->json([
            'message' => "{$deleted} sample request(s) deleted.",
            'deleted' => $deleted,
        ]);
    }

    // POST /api/products/{product}/sample-request
    public function store(Request $request, Product $product): JsonResponse
    {
        abort_unless($product->status === 'active', 404, 'Product not found.');
        abort_unless(
            $product->pdf_sample_path && Storage::disk('public')->exists($product->pdf_sample_path),
            404,
            'A sample is not available for this product.'
        );

        $data = $request->validate([
            'name'    => ['required', 'string', 'max:120'],
            'email'   => ['required', 'email', 'max:190'],
            'mobile'  => ['required', 'string', 'min:7', 'max:20', 'regex:/^[0-9+\-\s()]+$/'],
            'company' => ['required', 'string', 'max:190'],
        ]);

        // Save the lead first, so it is kept even if an email fails later
        $lead = SampleRequest::create($data + [
            'product_id' => $product->id,
            'ip'         => $request->ip(),
        ]);

        // Both emails are sent AFTER the response, so the popup answers instantly
        // instead of waiting several seconds for the mail server.
        // 1) the customer's sample (sent_at is filled in only when it really went out;
        //    the admin list shows "Not sent" for any that failed)
        dispatch(function () use ($lead, $product) {
            try {
                Mail::to($lead->email)->send(new SampleRequestMail($lead, $product));
                $lead->update(['sent_at' => now()]);
            } catch (\Throwable $e) {
                report($e);   // see storage/logs/laravel.log
            }
        })->afterResponse();

        // 2) the notification to sales
        AdminNotifier::sampleRequest($lead, $product);

        return response()->json(['message' => "Sample is on its way to {$lead->email}"]);
    }
}
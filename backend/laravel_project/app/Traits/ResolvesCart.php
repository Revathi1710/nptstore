<?php

namespace App\Traits;

use App\Models\Cart;
use Illuminate\Http\Request;

trait ResolvesCart
{
    protected function getOrCreateCart(Request $request): Cart
    {
        // ── Authenticated user takes priority ──
        if ($request->user()) {
            return Cart::firstOrCreate(['user_id' => $request->user()->id]);
        }

        // ── Guest: requires X-Session-Id ──
        $sessionId = $request->header('X-Session-Id');

        if (!$sessionId) {
            // ✅ Return empty cart object instead of aborting
            // This prevents the 400 loop when session is missing
            return new Cart(['session_id' => null, 'items' => collect()]);
        }

        return Cart::firstOrCreate(['session_id' => $sessionId]);
    }

    protected function cartSummary(Cart $cart): array
    {
        // ✅ Only load if cart exists in DB (has an id)
        if ($cart->id) {
            $cart->load('items.product.images');
        }

        return [
            'data'  => $cart->items ?? collect(),
            'total' => ($cart->items ?? collect())->sum(
                fn($item) => $item->quantity * ($item->product->active_price ?? $item->product->price ?? 0)
            ),
            'count' => ($cart->items ?? collect())->sum('quantity'),
        ];
    }
}
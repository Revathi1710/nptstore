<?php
namespace App\Traits;

use App\Models\Cart;
use Illuminate\Http\Request;

trait ResolvesCart {

    protected function getOrCreateCart(Request $request): Cart {
        if ($request->user()) {
            return Cart::firstOrCreate(['user_id' => $request->user()->id]);
        }

        $sessionId = $request->header('X-Session-Id');
        abort_if(!$sessionId, 401, 'No session ID provided');

        return Cart::firstOrCreate(['session_id' => $sessionId]);
    }

    protected function cartSummary(Cart $cart): array {
        $cart->load('items.product.images');

        $total = $cart->items->sum(fn($i) =>
            ($i->product->active_price ?? $i->product->price) * $i->quantity
        );

        return [
            'data'  => $cart->items->values(),
            'total' => round($total, 2),
            'count' => $cart->items->sum('quantity'),
        ];
    }
}
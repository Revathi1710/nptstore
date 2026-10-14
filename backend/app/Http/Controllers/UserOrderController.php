<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class UserOrderController extends Controller
{
    // GET /api/users/{id}/orders   (used by the "View orders" modal in AllUser)
    public function index($id): JsonResponse
    {
        $user = User::findOrFail($id);

        $orders = Order::with(['items.product.images'])
            ->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)              // placed while logged in
                  ->orWhere('customer_email', $user->email); // guest orders with the same email
            })
            ->latest()
            ->get();

        return response()->json(['orders' => $orders]);
    }
}
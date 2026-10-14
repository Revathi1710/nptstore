<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class MyOrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 401);
        }

        $orders = Order::with(['items.product.images'])
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    /**
     * Download paid order item files (PDF or Excel)
     */
    public function downloadItem(Request $request, $orderId, $productId, string $type): StreamedResponse|JsonResponse
    {
        $user = $request->user();

        // 1. Ensure order belongs to user
        $order = Order::where('id', $orderId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        // 2. Ensure order is paid
        if ($order->status !== 'paid') {
            return response()->json(['message' => 'Payment required to download files.'], 403);
        }

        // 3. Ensure item exists in order
        $item = $order->items()->where('product_id', $productId)->firstOrFail();
        $product = Product::findOrFail($productId);

        // 4. Resolve exact storage path based on type
        $relativePath = ($type === 'pdf') ? $product->pdf_full_path : $product->excel_path;

        if (!$relativePath || !Storage::disk('public')->exists($relativePath)) {
            return response()->json(['message' => ucfirst($type) . ' file not found for this product.'], 404);
        }

        // 5. Download directly from public storage disk
        $extension = ($type === 'pdf') ? 'pdf' : 'xlsx';
        $downloadName = ($product->slug ?? 'report-' . $product->id) . '.' . $extension;

        return Storage::disk('public')->download($relativePath, $downloadName);
    }
}
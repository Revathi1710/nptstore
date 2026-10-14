<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class OrderDownloadController extends Controller
{
    private const DISK = 'public';

    public function excel(Request $request, Order $order, Product $product): StreamedResponse
    {
        $this->assertProductInOrder($order, $product);

        abort_unless($product->excel_path, 404, 'No file available for this product.');
        abort_unless(Storage::disk(self::DISK)->exists($product->excel_path), 404, 'File not found on server.');

        return Storage::disk(self::DISK)->download(
            $product->excel_path,
            $product->excel_original_name ?? ($product->name . '.xlsx'),
            ['Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
        );
    }

    public function pdf(Request $request, Order $order, Product $product): StreamedResponse
    {
        $this->assertProductInOrder($order, $product);

        abort_unless($product->pdf_full_path, 404, 'No PDF available for this product.');
        abort_unless(Storage::disk(self::DISK)->exists($product->pdf_full_path), 404, 'File not found on server.');

        return Storage::disk(self::DISK)->download(
            $product->pdf_full_path,
            $product->pdf_full_original_name ?? ($product->code . '-full.pdf'),
            ['Content-Type' => 'application/pdf']
        );
    }

    private function assertProductInOrder(Order $order, Product $product): void
    {
        abort_unless(
            $order->items()->where('product_id', $product->id)->exists(),
            403,
            'This file does not belong to your order.'
        );
    }
}
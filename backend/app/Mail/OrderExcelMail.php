<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\URL;

class OrderExcelMail extends Mailable
{
    use Queueable, SerializesModels;

    /** Each entry: ['type' => 'excel|pdf', 'name' => 'Product (Excel)', 'url' => signed url] */
    public array $downloadLinks = [];

    public function __construct(public Order $order)
    {
        $this->order->loadMissing('items.product');

        foreach ($this->order->items as $item) {
            $product = $item->product;

            if (! $product) {
                Log::info('OrderExcelMail: skipping item, no product', ['item_id' => $item->id]);
                continue;
            }

            $params = [
                'order'   => $this->order->id,
                'product' => $product->id,
            ];

            // Excel / data file
            if ($product->excel_path) {
                $this->downloadLinks[] = [
                    'type' => 'excel',
                    'name' => $product->name . ' (Excel)',
                    'url'  => URL::temporarySignedRoute('order.download.excel', now()->addDays(7), $params),
                ];
            }

            // Full version PDF
            if ($product->pdf_full_path) {
                $this->downloadLinks[] = [
                    'type' => 'pdf',
                    'name' => $product->name . ' (Full PDF)',
                    'url'  => URL::temporarySignedRoute('order.download.pdf', now()->addDays(7), $params),
                ];
            }

            if (! $product->excel_path && ! $product->pdf_full_path) {
                Log::info('OrderExcelMail: skipping item, no excel or pdf', [
                    'item_id'    => $item->id,
                    'product_id' => $product->id,
                ]);
            }
        }

        if (empty($this->downloadLinks)) {
            Log::warning('OrderExcelMail: no download links generated', [
                'order_id' => $this->order->id,
            ]);
        }
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your NPTStore Order #' . $this->order->id . ' — Reports Ready',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.order-excel',
            with: [
                'order'         => $this->order,
                'downloadLinks' => $this->downloadLinks,
            ],
        );
    }

    // No attachments() — signed download links are sent instead
}
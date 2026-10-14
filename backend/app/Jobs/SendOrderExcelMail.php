<?php

namespace App\Jobs;

use App\Mail\OrderExcelMail;
use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendOrderExcelMail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries   = 3;
    public int $timeout = 120;

    public function __construct(public Order $order) {}

    public function handle(): void
    {
        $this->order->load('items.product');

        try {
            Mail::to($this->order->customer_email)
                ->send(new OrderExcelMail($this->order));

            Log::info('Order Excel Mail sent', [
                'order_id' => $this->order->id,
                'email'    => $this->order->customer_email,
            ]);
        } catch (\Throwable $e) {
            Log::error('Order Excel Mail FAILED', [
                'order_id' => $this->order->id,
                'email'    => $this->order->customer_email,
                'error'    => $e->getMessage(),
            ]);
            throw $e;
        }
    }
}
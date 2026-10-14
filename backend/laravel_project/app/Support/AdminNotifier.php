<?php

namespace App\Support;

use App\Mail\OrderAdminMail;
use App\Mail\SampleRequestAdminMail;
use App\Models\Order;
use App\Models\Product;
use App\Models\SampleRequest;
use Illuminate\Support\Facades\Mail;

/**
 * Sends internal notifications to the sales mailbox.
 * They run after the HTTP response is sent and never throw, so a mail problem
 * can't slow down or break the customer's checkout or sample request.
 */
class AdminNotifier
{
    public static function address(): string
    {
        return config('services.admin_email', 'sales@newprojectstracker.in');
    }

    public static function sampleRequest(SampleRequest $lead, Product $product): void
    {
        dispatch(function () use ($lead, $product) {
            try {
                Mail::to(self::address())->send(new SampleRequestAdminMail($lead, $product));
            } catch (\Throwable $e) {
                report($e);
            }
        })->afterResponse();
    }

    public static function order(Order $order): void
    {
        dispatch(function () use ($order) {
            try {
                Mail::to(self::address())->send(new OrderAdminMail($order));
            } catch (\Throwable $e) {
                report($e);
            }
        })->afterResponse();
    }
}
<?php

namespace App\Mail;

use App\Models\Order;
use App\Models\User;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

// Sent to the sales mailbox whenever an order is paid
class OrderAdminMail extends Mailable
{
    public bool $isRegistered;

    public function __construct(public Order $order)
    {
        $order->loadMissing('items.product');

        $this->isRegistered = $order->user_id
            ? true
            : User::where('email', $order->customer_email)->where('is_verified', 1)->exists();
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            replyTo: [new Address($this->order->customer_email, $this->order->customer_name)],
            subject: "New order #{$this->order->id} – ₹" . number_format($this->order->total) . " – {$this->order->customer_name}",
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.order-admin');
    }
}
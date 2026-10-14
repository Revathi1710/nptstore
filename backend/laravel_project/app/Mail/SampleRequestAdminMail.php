<?php

namespace App\Mail;

use App\Models\Product;
use App\Models\SampleRequest;
use App\Models\User;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

// Sent to the sales mailbox whenever someone requests a free sample
class SampleRequestAdminMail extends Mailable
{
    public bool $isRegistered;

    public function __construct(public SampleRequest $lead, public Product $product)
    {
        // "Registered" = a verified account with this email exists
        $this->isRegistered = User::where('email', $lead->email)->where('is_verified', 1)->exists();
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            // "Reply" in the inbox goes straight to the lead
            replyTo: [new Address($this->lead->email, $this->lead->name)],
            subject: "New sample request: {$this->lead->name} – {$this->product->name}",
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.sample-request-admin');
    }
}
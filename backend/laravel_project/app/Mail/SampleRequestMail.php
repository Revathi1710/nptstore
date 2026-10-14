<?php

namespace App\Mail;

use App\Models\Product;
use App\Models\SampleRequest;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Support\Facades\Storage;

class SampleRequestMail extends Mailable
{
    // Above this size the PDF is sent as a download link instead of an attachment
    private const MAX_ATTACH_BYTES = 15 * 1024 * 1024;

    public bool $attached = false;
    public ?string $downloadUrl = null;

    public function __construct(public SampleRequest $lead, public Product $product)
    {
        $disk = Storage::disk('public');
        $path = $product->pdf_sample_path;

        if ($path && $disk->exists($path) && $disk->size($path) <= self::MAX_ATTACH_BYTES) {
            $this->attached = true;
        } else {
            // existing public route: GET /api/products/{product}/download-pdf/sample
            $this->downloadUrl = route('products.download-pdf', [$product->id, 'sample']);
        }
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Your free sample: ' . $this->product->name);
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.sample-request',
            with: [
                'lead'        => $this->lead,
                'product'     => $this->product,
                'attached'    => $this->attached,
                'downloadUrl' => $this->downloadUrl,
            ],
        );
    }

    public function attachments(): array
    {
        if (! $this->attached) {
            return [];
        }

        $name = $this->product->pdf_sample_original_name
            ?? ($this->product->code . '-sample.pdf');

        return [
            Attachment::fromStorageDisk('public', $this->product->pdf_sample_path)
                ->as($name)
                ->withMime('application/pdf'),
        ];
    }
}
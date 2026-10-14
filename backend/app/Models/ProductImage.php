<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class ProductImage extends Model
{
    protected $fillable = [
        'product_id',
        'filename',
        'original_name',
        'mime_type',
        'size',
        'path',
        // NOTE: 'url' is intentionally NOT here.
        // It is a computed accessor — never stored in the database.
        'sort_order',
    ];

    protected $casts = [
        'size'       => 'integer',
        'sort_order' => 'integer',
    ];

    /**
     * Always append the dynamic 'url' field to JSON output.
     */
    protected $appends = ['url'];

    /**
     * Dynamic URL accessor.
     *
     * Generates the public URL from the stored relative path at runtime,
     * using the APP_URL value from .env.
     *
     * - On localhost:  http://localhost/storage/products/4/uuid.webp
     * - On production: https://yourdomain.com/storage/products/4/uuid.webp
     *
     * This means you NEVER have stale localhost URLs in your database.
     */
    public function getUrlAttribute(): string
    {
        return Storage::disk('public')->url($this->path);
    }

    /**
     * Relationship: belongs to a product.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Auto-delete the physical file when this record is deleted.
     */
    protected static function booted(): void
    {
        static::deleting(function (ProductImage $image) {
            Storage::disk('public')->delete($image->path);
        });
    }
}
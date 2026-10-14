<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SampleRequest extends Model
{
    protected $fillable = [
        'product_id', 'name', 'email', 'mobile', 'company', 'ip', 'sent_at',
    ];

    protected $casts = ['sent_at' => 'datetime'];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
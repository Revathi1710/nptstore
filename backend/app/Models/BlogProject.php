<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BlogProject extends Model
{
    protected $fillable = [
        'blog_id', 'promoter', 'products_capacity',
        'location', 'investment', 'completion', 'summary', 'sort_order',
    ];

    public function blog(): BelongsTo
    {
        return $this->belongsTo(Blog::class);
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Blog extends Model
{
    protected $fillable = [
        'title', 'slug', 'category', 'blog_type', 'status',
        'short_description', 'content', 'featured_image',
        'author', 'published_at',
        'meta_title', 'meta_description', 'meta_keywords',
    ];

    protected $casts = [
        'published_at' => 'date',
    ];

    // ── Relationships ─────────────────────────────────────────────────────────
    public function projects(): HasMany
    {
        return $this->hasMany(BlogProject::class)->orderBy('sort_order');
    }
}
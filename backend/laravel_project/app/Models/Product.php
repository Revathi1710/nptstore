<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name', 'slug', 'code', 'published_in', 'format', 'total_projects',
        'description', 'highlights', 'status', 'price', 'quantity',

        // Classification (optional)
        'state',
        'region',
        'segment',
        'industry',
        'year',

        // Description tabs
        'description_overview',
        'description_top_companies',
        'description_whats_inside',
        'description_faq',

        // Excel
        'excel_filename', 'excel_original_name', 'excel_path', 'excel_size', 'excel_mime',

        // PDFs
        'pdf_full_path', 'pdf_full_original_name', 'pdf_full_size',
        'pdf_sample_path', 'pdf_sample_original_name', 'pdf_sample_size',
    ];

    protected $casts = [
        'price'           => 'decimal:2',
        'quantity'        => 'integer',
        'year'            => 'integer',
        'excel_size'      => 'integer',
        'pdf_full_size'   => 'integer',
        'pdf_sample_size' => 'integer',
    ];

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class);
    }
}
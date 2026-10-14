<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'name'           => $this->name,
            'slug'           => $this->slug,
            'code'           => $this->code,
            'published_in'   => $this->published_in,
            'format'         => $this->format,
            'total_projects' => $this->total_projects,
            'description'    => $this->description,
            'highlights'     => $this->highlights,
            'status'         => $this->status,
            'price'          => $this->price,
            'quantity'       => $this->quantity,
'original_price' => $this->original_price,
'time_limit'     => $this->time_limit,
            // Classification (optional)
            'state'    => $this->state,
            'region'   => $this->region,
            'year'     => $this->year,
            'segment'  => $this->segment,
            'industry' => $this->industry,

            // Description tabs
            'description_overview'      => $this->description_overview,
            'description_top_companies' => $this->description_top_companies,
            'description_whats_inside'  => $this->description_whats_inside,
            'description_faq'           => $this->description_faq,

            'images' => ProductImageResource::collection($this->whenLoaded('images')),

            // Excel file info
            'excel_file' => $this->excel_path ? [
                'original_name' => $this->excel_original_name,
                'filename'      => $this->excel_filename,
                'size'          => $this->excel_size,
                'mime'          => $this->excel_mime,
                'url'           => Storage::disk('public')->url($this->excel_path),
                'download_url'  => route('products.download-excel', $this->id),
            ] : null,

            // PDFs
            'pdf_full' => $this->pdf_full_path ? [
                'name' => $this->pdf_full_original_name,
                'size' => $this->pdf_full_size,
                'url'  => url("/api/products/{$this->id}/download-pdf/full"),
            ] : null,

            'pdf_sample' => $this->pdf_sample_path ? [
                'name' => $this->pdf_sample_original_name,
                'size' => $this->pdf_sample_size,
                'url'  => Storage::disk('public')->url($this->pdf_sample_path),
            ] : null,

            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
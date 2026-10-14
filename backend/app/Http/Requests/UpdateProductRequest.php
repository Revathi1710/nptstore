<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $productId = $this->route('product')?->id ?? $this->route('product');

        return [
            'name'            => ['sometimes', 'required', 'string', 'max:255'],
            'code'            => ['sometimes', 'required', 'string', 'max:100', "unique:products,code,{$productId}"],
            'slug'            => ['sometimes', 'required', 'string', 'max:255', "unique:products,slug,{$productId}"],
            'published_in'    => ['sometimes', 'required', 'string', 'max:255'],
            'format'          => ['nullable', 'string', 'max:100'],
            'total_projects'  => ['nullable', 'string', 'max:255'],
            'description'     => ['nullable', 'string'],
            'status'          => ['sometimes', 'required', 'in:active,inactive'],
            'price'           => ['sometimes', 'required', 'numeric', 'min:0', 'max:9999999.99'],
            'quantity'        => ['sometimes', 'nullable', 'integer', 'min:0'],

            // Classification (all optional; empty string clears the value)
            'state'    => ['nullable', 'string', 'max:100'],
            'region'   => ['nullable', 'in:Central,Eastern,Northern,Southern,West'],
            'year'     => ['nullable', 'integer', 'digits:4', 'min:1900', 'max:2100'],
            'segment'  => ['nullable', 'string', 'max:150'],
            'industry' => ['nullable', 'string', 'max:150'],

            // Description tabs
            'description_overview'      => ['nullable', 'string'],
            'description_top_companies' => ['nullable', 'string'],
            'description_whats_inside'  => ['nullable', 'string'],
            'description_faq'           => ['nullable', 'string'],

            // Images
            'images'          => ['nullable', 'array', 'max:10'],
            'images.*'        => ['image', 'mimes:jpeg,png,jpg,webp', 'max:10240'],
            'remove_images'   => ['nullable', 'array'],
            'remove_images.*' => ['integer', 'exists:product_images,id'],

            // Excel / CSV: replaces any existing file when provided
            'excel_file' => [
                'nullable',
                'file',
                'mimetypes:application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,application/csv,text/plain,application/octet-stream',
                'max:20480',
            ],
            'remove_excel'    => ['nullable', 'boolean'],

            // PDFs: replace when provided, or delete via remove_* flags
            'pdf_full'          => ['nullable', 'file', 'mimes:pdf', 'max:51200'],
            'pdf_sample'        => ['nullable', 'file', 'mimes:pdf', 'max:20480'],
            'remove_pdf_full'   => ['nullable', 'boolean'],
            'remove_pdf_sample' => ['nullable', 'boolean'],
        ];
    }

    public function attributes(): array
    {
        return [
            'name'           => 'Product Name',
            'code'           => 'Product Code',
            'slug'           => 'Slug',
            'published_in'   => 'Published In',
            'format'         => 'Format',
            'total_projects' => 'Total Projects',
            'description'    => 'Description',
            'status'         => 'Status',
            'price'          => 'Price',
            'quantity'       => 'Quantity',
            'state'          => 'State',
            'region'         => 'Region',
            'year'           => 'Year',
            'segment'        => 'Segment',
            'industry'       => 'Industry',
            'images'         => 'Product Images',
            'images.*'       => 'Image',
            'remove_images'  => 'Images to Remove',
            'excel_file'     => 'Excel File',

            'description_overview'      => 'Overview',
            'description_top_companies' => 'Top Companies Covered',
            'description_whats_inside'  => "What's Inside",
            'description_faq'           => 'FAQ',
            'pdf_full'                  => 'Full Version PDF',
            'pdf_sample'                => 'Sample PDF',
        ];
    }

    public function messages(): array
    {
        return [
            'code.unique'            => 'This product code is already in use. Please choose a different one.',
            'slug.unique'            => 'This slug is already in use. Please choose a different one.',
            'price.min'              => 'Price cannot be negative.',
            'quantity.min'           => 'Quantity cannot be negative.',
            'images.*.image'         => 'Each uploaded file must be a valid image.',
            'images.*.max'           => 'Each image must not exceed 10 MB.',
            'remove_images.*.exists' => 'One or more selected images do not exist.',
            'excel_file.max'         => 'The Excel file must not exceed 20 MB.',
            'pdf_full.mimes'         => 'The full version must be a PDF file.',
            'pdf_full.max'           => 'The full version PDF must not exceed 50 MB.',
            'pdf_sample.mimes'       => 'The sample must be a PDF file.',
            'pdf_sample.max'         => 'The sample PDF must not exceed 20 MB.',
        ];
    }
}
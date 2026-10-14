<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'           => ['required', 'string', 'max:255'],
            'code'           => ['required', 'string', 'max:100', 'unique:products,code'],
            'slug'           => ['required', 'string', 'max:255', 'unique:products,slug'],
            'published_in'   => ['required', 'string', 'max:255'],
            'format'         => ['nullable', 'string', 'max:100'],
            'total_projects' => ['nullable', 'string', 'max:255'],
            'description'    => ['nullable', 'string'],
            'status'         => ['required', 'in:active,inactive'],
            'price'          => ['required', 'numeric', 'min:0', 'max:9999999.99'],
            'quantity'       => ['nullable', 'integer', 'min:0'],   // hidden in UI, defaults to 200000

            // Classification (all optional)
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

            // Product images
            'images'   => ['nullable', 'array', 'max:10'],
            'images.*' => ['image', 'mimes:jpeg,png,jpg,webp', 'max:10240'],

            // Excel / CSV data file (optional, single file)
            'excel_file' => [
                'nullable',
                'file',
                'mimetypes:application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,application/csv,text/plain,application/octet-stream',
                'max:20480',
            ],

            // PDFs
            'pdf_full'   => ['nullable', 'file', 'mimes:pdf', 'max:51200'],  // 50 MB
            'pdf_sample' => ['nullable', 'file', 'mimes:pdf', 'max:20480'],  // 20 MB
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
            'code.unique'      => 'This product code is already in use. Please choose a different one.',
            'slug.unique'      => 'This slug is already in use. Please choose a different one.',
            'price.min'        => 'Price cannot be negative.',
            'quantity.min'     => 'Quantity cannot be negative.',
            'images.*.image'   => 'Each uploaded file must be a valid image.',
            'images.*.max'     => 'Each image must not exceed 10 MB.',
            'excel_file.max'   => 'The Excel file must not exceed 20 MB.',
            'pdf_full.mimes'   => 'The full version must be a PDF file.',
            'pdf_full.max'     => 'The full version PDF must not exceed 50 MB.',
            'pdf_sample.mimes' => 'The sample must be a PDF file.',
            'pdf_sample.max'   => 'The sample PDF must not exceed 20 MB.',
        ];
    }
}
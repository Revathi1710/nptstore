<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductService
{
    private const DISK = 'public';
    private const DEFAULT_QUANTITY = 200000;

    // ─────────────────────────────────────────────
    // CREATE
    // ─────────────────────────────────────────────
    public function create(
        array $data,
        array $images = [],
        ?UploadedFile $excel = null,
        ?UploadedFile $pdfFull = null,
        ?UploadedFile $pdfSample = null
    ): Product {
        return DB::transaction(function () use ($data, $images, $excel, $pdfFull, $pdfSample) {
            $fields = $this->onlyProductFields($data);
            $fields['quantity'] = $fields['quantity'] ?? self::DEFAULT_QUANTITY;

            $product = Product::create($fields);

            $this->storeImages($product, $images);
            $this->storeExcel($product, $excel);
            $this->storePdf($product, $pdfFull, 'pdf_full');
            $this->storePdf($product, $pdfSample, 'pdf_sample');

            $product->save();

            return $product->load('images');
        });
    }

    // ─────────────────────────────────────────────
    // UPDATE
    // ─────────────────────────────────────────────
    public function update(
        Product $product,
        array $data,
        array $images = [],
        array $removeImageIds = [],
        ?UploadedFile $excel = null,
        bool $removeExcel = false,
        ?UploadedFile $pdfFull = null,
        ?UploadedFile $pdfSample = null,
        bool $removePdfFull = false,
        bool $removePdfSample = false
    ): Product {
        return DB::transaction(function () use (
            $product, $data, $images, $removeImageIds, $excel, $removeExcel,
            $pdfFull, $pdfSample, $removePdfFull, $removePdfSample
        ) {
            $product->fill($this->onlyProductFields($data));

            // Images
            if (!empty($removeImageIds)) {
                $product->images()->whereIn('id', $removeImageIds)->get()->each(function ($img) {
                    Storage::disk(self::DISK)->delete($img->path);
                    $img->delete();
                });
            }
            $this->storeImages($product, $images);

            // Excel
            if ($removeExcel && !$excel) {
                $this->removeExcel($product);
            }
            $this->storeExcel($product, $excel);

            // PDFs
            if ($removePdfFull && !$pdfFull)     $this->removePdf($product, 'pdf_full');
            if ($removePdfSample && !$pdfSample) $this->removePdf($product, 'pdf_sample');
            $this->storePdf($product, $pdfFull, 'pdf_full');
            $this->storePdf($product, $pdfSample, 'pdf_sample');

            $product->save();

            return $product->load('images');
        });
    }

    // ─────────────────────────────────────────────
    // DELETE
    // ─────────────────────────────────────────────
    public function delete(Product $product): void
    {
        // Product uses SoftDeletes, so files are kept until you force-delete.
        // Uncomment to remove files on every delete:
        // $this->purgeFiles($product);

        $product->delete();
    }

    public function forceDelete(Product $product): void
    {
        $this->purgeFiles($product);
        $product->forceDelete();
    }

    // ─────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────
    private function onlyProductFields(array $data): array
    {
        return collect($data)->except([
            'images', 'excel_file', 'pdf_full', 'pdf_sample',
            'remove_images', 'remove_excel', 'remove_pdf_full', 'remove_pdf_sample',
        ])->all();
    }

    private function storeImages(Product $product, array $files): void
    {
        $currentMax = $product->images()->max('sort_order') ?? -1;

        foreach ($files as $index => $file) {
            $ext      = $file->getClientOriginalExtension();
            $filename = Str::uuid() . '.' . $ext;
            $folder   = "products/{$product->id}";

            $path = $file->storeAs($folder, $filename, self::DISK);
            $url  = Storage::disk(self::DISK)->url($path);

            $product->images()->create([
                'filename'      => $filename,
                'original_name' => $file->getClientOriginalName(),
                'mime_type'     => $file->getMimeType(),
                'size'          => $file->getSize(),
                'path'          => $path,
                'url'           => $url,
                'sort_order'    => $currentMax + $index + 1,
            ]);
        }
    }

    private function storeExcel(Product $product, ?UploadedFile $file): void
    {
        if (!$file) return;

        $this->removeExcel($product);

        $path = $file->store('products/excel', self::DISK);

        $product->excel_path          = $path;
        $product->excel_filename      = basename($path);
        $product->excel_original_name = $file->getClientOriginalName();
        $product->excel_size          = $file->getSize();
        $product->excel_mime          = $file->getClientMimeType();
    }

    private function removeExcel(Product $product): void
    {
        if ($product->excel_path) {
            Storage::disk(self::DISK)->delete($product->excel_path);
        }
        $product->excel_path = $product->excel_filename = $product->excel_original_name
            = $product->excel_size = $product->excel_mime = null;
    }

    /** $prefix is 'pdf_full' or 'pdf_sample' */
    private function storePdf(Product $product, ?UploadedFile $file, string $prefix): void
    {
        if (!$file) return;

        $this->removePdf($product, $prefix);

        $product->{"{$prefix}_path"}          = $file->store("products/pdfs/{$prefix}", self::DISK);
        $product->{"{$prefix}_original_name"} = $file->getClientOriginalName();
        $product->{"{$prefix}_size"}          = $file->getSize();
    }

    private function removePdf(Product $product, string $prefix): void
    {
        if ($product->{"{$prefix}_path"}) {
            Storage::disk(self::DISK)->delete($product->{"{$prefix}_path"});
        }
        $product->{"{$prefix}_path"} = $product->{"{$prefix}_original_name"} = $product->{"{$prefix}_size"} = null;
    }

    private function purgeFiles(Product $product): void
    {
        foreach ($product->images as $img) {
            Storage::disk(self::DISK)->delete($img->path);
        }
        foreach (['excel_path', 'pdf_full_path', 'pdf_sample_path'] as $col) {
            if ($product->{$col}) {
                Storage::disk(self::DISK)->delete($product->{$col});
            }
        }
    }
}
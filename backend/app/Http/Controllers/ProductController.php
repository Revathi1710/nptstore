<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ProductController extends Controller
{
    public function __construct(protected ProductService $service)
    {
    }

    // GET /api/products
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Product::with('images');

        // Status filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        // Filter by Dynamic Columns (state, region, segment, industry, year)
        $filterFields = ['state', 'region', 'segment', 'industry', 'year'];
        foreach ($filterFields as $field) {
            if ($request->filled($field)) {
                $query->where($field, $request->get($field));
            }
        }

        // Sorting
        $sortBy  = in_array($request->sort_by, ['name', 'price', 'quantity', 'created_at']) ? $request->sort_by : 'year';
        $sortDir = $request->sort_dir === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sortBy, $sortDir);

        $products = $query->paginate($request->get('per_page', 15));

        return ProductResource::collection($products);
    }

    // GET /api/product-filters (Dropdown options ke liye)
    public function getFilters(): JsonResponse
    {
        return response()->json([
            'data' => [
                'state'    => Product::whereNotNull('state')->distinct()->pluck('state'),
                'region'   => Product::whereNotNull('region')->distinct()->pluck('region'),
                'segment'  => Product::whereNotNull('segment')->distinct()->pluck('segment'),
                'industry' => Product::whereNotNull('industry')->distinct()->pluck('industry'),
                'year'     => Product::whereNotNull('year')->distinct()->pluck('year'),
            ]
        ]);
    }

    // POST /api/products
    public function store(StoreProductRequest $request): JsonResponse
    {
        $product = $this->service->create(
            $request->validated(),
            $request->file('images', []),
            $request->file('excel_file'),
            $request->file('pdf_full'),
            $request->file('pdf_sample')
        );

        return response()->json([
            'message' => 'Product created successfully.',
            'data'    => new ProductResource($product),
        ], 201);
    }

    // GET /api/products/{product}
    public function show(Product $product): JsonResponse
    {
        $product->load('images');

        return response()->json([
            'data' => new ProductResource($product),
        ]);
    }

    // GET /api/product-by-slug/{slug}
    public function showBySlug(string $slug): JsonResponse
    {
        $product = Product::with('images')
            ->where('slug', $slug)
            ->where('status', 'active')
            ->firstOrFail();

        return response()->json([
            'data' => new ProductResource($product),
        ]);
    }

    // PUT /api/products/{product}
    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $updated = $this->service->update(
            $product,
            $request->validated(),
            $request->file('images', []),
            $request->input('remove_images', []),
            $request->file('excel_file'),
            (bool) $request->input('remove_excel', false),
            $request->file('pdf_full'),
            $request->file('pdf_sample'),
            (bool) $request->input('remove_pdf_full', false),
            (bool) $request->input('remove_pdf_sample', false)
        );

        return response()->json([
            'message' => 'Product updated successfully.',
            'data'    => new ProductResource($updated),
        ]);
    }

    // DELETE /api/products/{product}
    public function destroy(Product $product): JsonResponse
    {
        $this->service->delete($product);

        return response()->json([
            'message' => 'Product deleted successfully.',
        ]);
    }

    // GET /api/products/{product}/download-excel
    public function downloadExcel(Product $product): StreamedResponse|JsonResponse
    {
        if (!$product->excel_path || !Storage::disk('public')->exists($product->excel_path)) {
            return response()->json(['message' => 'No Excel file found for this product.'], 404);
        }

        return Storage::disk('public')->download(
            $product->excel_path,
            $product->excel_original_name ?? $product->excel_filename
        );
    }

    // GET /api/products/{product}/download-pdf/{type}   (type = full | sample)
    public function downloadPdf(Product $product, string $type): StreamedResponse|JsonResponse
    {
        abort_unless(in_array($type, ['full', 'sample'], true), 404);

        $path = $product->{"pdf_{$type}_path"};

        if (!$path || !Storage::disk('public')->exists($path)) {
            return response()->json(['message' => 'PDF not found for this product.'], 404);
        }

        return Storage::disk('public')->download(
            $path,
            $product->{"pdf_{$type}_original_name"} ?? "{$product->slug}-{$type}.pdf"
        );
    }
}
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminAuthController;
// Controllers
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AddressController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\OrderDownloadController;
use App\Http\Controllers\MyOrderController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\ExcelUploadController;
use App\Http\Controllers\SampleRequestController;
use App\Http\Controllers\UserOrderController;
// ─────────────────────────────────────────────────────────
// Authenticated User
// ─────────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
Route::post('/upload-projects', [ExcelUploadController::class, 'uploadExcel']);   // ⚠️ see security note at the bottom

// ─────────────────────────────────────────────────────────
// Auth Routes: passwordless (email code). Sign in and sign up are the same flow.
// ─────────────────────────────────────────────────────────
Route::post('/auth/send-code',   [AuthController::class, 'sendCode'])->middleware('throttle:6,1');
Route::post('/auth/verify-code', [AuthController::class, 'verifyCode'])->middleware('throttle:10,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', fn (Request $request) => $request->user());
    Route::get('/my-orders', [MyOrderController::class, 'index']);
    Route::get('/orders/{order}/items/{product}/download/{type}', [MyOrderController::class, 'downloadItem'])
        ->whereIn('type', ['pdf', 'excel']);
    Route::get('/user/profile', [AuthController::class, 'getProfile']);
    Route::post('/user/update', [AuthController::class, 'updateProfile']);

    // Saved addresses (dashboard page + checkout cards)
    Route::get('/addresses',                [AddressController::class, 'index']);
    Route::post('/addresses',               [AddressController::class, 'store']);
    Route::put('/addresses/{id}',           [AddressController::class, 'update']);
    Route::post('/addresses/{id}/default',  [AddressController::class, 'setDefault']);
    Route::delete('/addresses/{id}',        [AddressController::class, 'destroy']);
});

// ─────────────────────────────────────────────────────────
// Cart Routes
// ─────────────────────────────────────────────────────────
Route::get('/cart',               [CartController::class, 'index']);
Route::post('/cart',              [CartController::class, 'add']);
Route::put('/cart/{cartItem}',    [CartController::class, 'update']);
Route::delete('/cart/clear',      [CartController::class, 'clear']);
Route::delete('/cart/{cartItem}', [CartController::class, 'remove']);

Route::middleware('auth:sanctum')->post('/cart/merge', [CartController::class, 'merge']);

// ─────────────────────────────────────────────────────────
// Product Routes
// ─────────────────────────────────────────────────────────
Route::get('/product-by-slug/{slug}', [ProductController::class, 'showBySlug']);
Route::get('/product-filters', [ProductController::class, 'getFilters']); // ← Filter options endpoint

Route::prefix('products')->group(function () {
    Route::get('/',             [ProductController::class, 'index']);
    Route::post('/',            [ProductController::class, 'store']);        // ⚠️ admin only (see note)

    // specific routes first
    Route::get('/{product}/download-excel', [ProductController::class, 'downloadExcel'])
        ->name('products.download-excel');

    Route::get('/{product}/download-pdf/{type}', [ProductController::class, 'downloadPdf'])
        ->whereIn('type', ['full', 'sample'])
        ->name('products.download-pdf');

    // "Download Sample" popup: saves the lead and emails the sample PDF
    Route::post('/{product}/sample-request', [SampleRequestController::class, 'store'])
        ->middleware('throttle:5,1');   // max 5 requests per minute per IP

    Route::get('/{product}',    [ProductController::class, 'show']);
    Route::put('/{product}',    [ProductController::class, 'update']);       // ⚠️ admin only (see note)
    Route::post('/{product}',   [ProductController::class, 'update']);       // ⚠️ admin only (see note)
    Route::delete('/{product}', [ProductController::class, 'destroy']);     // ⚠️ admin only (see note)
});

// ─────────────────────────────────────────────────────────
// Orders  (checkout is public: guests and logged-in users)
// ─────────────────────────────────────────────────────────
// The order is created when "Pay" is clicked, then confirmed or failed
Route::post('/orders',        [OrderController::class, 'store'])->middleware('throttle:20,1');
Route::post('/orders/verify', [OrderController::class, 'verify'])->middleware('throttle:60,1');   // payment succeeded
Route::post('/orders/fail',   [OrderController::class, 'fail'])->middleware('throttle:60,1');     // window closed / payment failed
Route::get('/orders',         [OrderController::class, 'index']);   // ⚠️ lists ALL orders: admin only (see note)

// Signed download links sent in the order email (valid 7 days)
Route::get('/orders/{order}/download/{product}', [OrderDownloadController::class, 'excel'])
    ->name('order.download.excel')
    ->middleware('signed');

Route::get('/orders/{order}/download-pdf/{product}', [OrderDownloadController::class, 'pdf'])
    ->name('order.download.pdf')
    ->middleware('signed');

// ─────────────────────────────────────────────────────────
// Blog Routes
// ⚠️  IMPORTANT: slug route MUST come BEFORE /{blog} wildcard
// ─────────────────────────────────────────────────────────
Route::prefix('blogs')->group(function () {
    Route::get('/slug/{slug}', [BlogController::class, 'showBySlug']); // ← FIRST
    Route::get('/',            [BlogController::class, 'index']);
    Route::post('/',           [BlogController::class, 'store']);        // ⚠️ admin only (see note)
    Route::get('/{blog}',      [BlogController::class, 'show']);
    Route::put('/{blog}',      [BlogController::class, 'update']);       // ⚠️ admin only (see note)
    Route::delete('/{blog}',   [BlogController::class, 'destroy']);      // ⚠️ admin only (see note)
});

// ─────────────────────────────────────────────────────────
// Admin
// ─────────────────────────────────────────────────────────
// Login
Route::post('/admin/login', [AdminAuthController::class, 'login'])->middleware('throttle:10,1');

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/admin/change-password', [AdminAuthController::class, 'changePassword']);
});

Route::get('/all-users', [AuthController::class, 'allUsers']);                 // ⚠️ admin only (see note)

// orders for one user (AllUser "View orders" modal)
Route::get('/users/{id}/orders', [UserOrderController::class, 'index']);      // ⚠️ admin only (see note)

// sample download requests (DownloadSampleUser admin page)
Route::get('/sample-requests', [SampleRequestController::class, 'index']);    // ⚠️ admin only (see note)
Route::post('/sample-requests/bulk-delete', [SampleRequestController::class, 'bulkDestroy']);
Route::delete('/sample-requests/{sampleRequest}', [SampleRequestController::class, 'destroy']);
// List all PDFs
Route::get('/pdf-files', function () {                                         // ⚠️ admin only (see note)
    $files = \App\Models\PdfFile::latest()->get()->map(function ($f) {
        return [
            'id'         => $f->id,
            'filename'   => $f->filename,
            'created_at' => $f->created_at->format('d M Y h:i A'),
        ];
    });
    return response()->json($files);
});

// Download/View a PDF by ID
Route::get('/pdf-files/{id}/download', function ($id) {                        // ⚠️ admin only (see note)
    $pdfFile    = \App\Models\PdfFile::findOrFail($id);
    $pdfContent = base64_decode($pdfFile->pdf_base64);

    return response($pdfContent, 200, [
        'Content-Type'        => 'application/pdf',
        'Content-Disposition' => 'inline; filename="' . $pdfFile->filename . '"',
    ]);
});

/*
 |--------------------------------------------------------------------------
 | SECURITY NOTE: every route marked "admin only" above is currently PUBLIC.
 | Anyone who knows the URL can read all customers and orders, upload projects,
 | and create / edit / delete products and blogs. Move them into an admin-only
 | group once your admin panel sends its token (see the reply for details).
 |--------------------------------------------------------------------------
 */
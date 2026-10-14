<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BlogController extends Controller
{
    // ── GET /api/blogs ────────────────────────────────────────────────────────
    public function index(Request $request): JsonResponse
    {
        $query = Blog::with('projects')->latest();

        // Filter by status (e.g. ?status=published for frontend listing)
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Optional limit (e.g. ?limit=5 for sidebar recent posts)
        if ($request->filled('limit')) {
            $query->limit((int) $request->limit);
        }

        return response()->json(['data' => $query->get()]);
    }

    // ── GET /api/blogs/slug/{slug} ────────────────────────────────────────────
    // NOTE: Register this route BEFORE apiResource in api.php:
    //   Route::get('blogs/slug/{slug}', [BlogController::class, 'showBySlug']);
    //   Route::apiResource('blogs', BlogController::class);
    public function showBySlug(string $slug): JsonResponse
    {
        $blog = Blog::with('projects')
            ->where('slug', $slug)
            ->where('status', 'published')
            ->firstOrFail();

        return response()->json(['data' => $blog]);
    }

    // ── GET /api/blogs/{id} ───────────────────────────────────────────────────
    public function show(Blog $blog): JsonResponse
    {
        return response()->json(['data' => $blog->load('projects')]);
    }

    // ── POST /api/blogs ───────────────────────────────────────────────────────
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'             => 'required|string|max:255',
            'slug'              => 'required|string|max:255|unique:blogs,slug',
            'category'          => 'nullable|string|max:100',
            'blog_type'         => 'nullable|string|max:100',
            'status'            => 'required|in:published,draft,inactive',
            'short_description' => 'nullable|string',
            'content'           => 'nullable|string',
            'featured_image'    => 'nullable|image|mimes:jpeg,png,jpg,webp|max:10240',
            'author'            => 'nullable|string|max:255',
            'published_at'      => 'nullable|date',
            'meta_title'        => 'nullable|string|max:255',
            'meta_description'  => 'nullable|string|max:500',
            'meta_keywords'     => 'nullable|string|max:500',
            'projects'          => 'nullable|string', // JSON encoded array
        ]);

        // Handle featured image upload
        $imagePath = null;
        if ($request->hasFile('featured_image')) {
            $imagePath = $request->file('featured_image')
                ->store('blogs/images', 'public');
        }

        // Auto-generate slug if somehow empty
        $slug = $validated['slug'] ?? Str::slug($validated['title']);

        $blog = Blog::create([
            'title'             => $validated['title'],
            'slug'              => $slug,
            'category'          => $validated['category']          ?? null,
            'blog_type'         => $validated['blog_type']         ?? null,
            'status'            => $validated['status'],
            'short_description' => $validated['short_description'] ?? null,
            'content'           => $validated['content']           ?? null,
            'featured_image'    => $imagePath,
            'author'            => $validated['author']            ?? null,
            'published_at'      => $validated['published_at']      ?? null,
            'meta_title'        => $validated['meta_title']        ?? null,
            'meta_description'  => $validated['meta_description']  ?? null,
            'meta_keywords'     => $validated['meta_keywords']     ?? null,
        ]);

        // Save project detail rows
        if (!empty($validated['projects'])) {
            $projects = json_decode($validated['projects'], true);
            if (is_array($projects)) {
                foreach ($projects as $i => $proj) {
                    $blog->projects()->create([
                        'promoter'          => $proj['promoter']          ?? null,
                        'products_capacity' => $proj['products_capacity'] ?? null,
                        'location'          => $proj['location']          ?? null,
                        'investment'        => $proj['investment']        ?? null,
                        'completion'        => $proj['completion']        ?? null,
                        'summary'           => $proj['summary']           ?? null,
                        'sort_order'        => $i,
                    ]);
                }
            }
        }

        return response()->json(['data' => $blog->load('projects')], 201);
    }

    // ── PUT /api/blogs/{id} ───────────────────────────────────────────────────
    // From React (EditBlog.jsx), send as POST with fd.append('_method', 'PUT')
    // because multipart/form-data does not support PUT natively in browsers.
    public function update(Request $request, Blog $blog): JsonResponse
    {
        $validated = $request->validate([
            'title'             => 'required|string|max:255',
            'slug'              => 'required|string|max:255|unique:blogs,slug,' . $blog->id,
            'category'          => 'nullable|string|max:100',
            'blog_type'         => 'nullable|string|max:100',
            'status'            => 'required|in:published,draft,inactive',
            'short_description' => 'nullable|string',
            'content'           => 'nullable|string',
            'featured_image'    => 'nullable|image|mimes:jpeg,png,jpg,webp|max:10240',
            'author'            => 'nullable|string|max:255',
            'published_at'      => 'nullable|date',
            'meta_title'        => 'nullable|string|max:255',
            'meta_description'  => 'nullable|string|max:500',
            'meta_keywords'     => 'nullable|string|max:500',
            'projects'          => 'nullable|string',
        ]);

        // Handle image replacement
        if ($request->hasFile('featured_image')) {
            // Delete old image from storage
            if ($blog->featured_image) {
                Storage::disk('public')->delete($blog->featured_image);
            }
            $validated['featured_image'] = $request->file('featured_image')
                ->store('blogs/images', 'public');
        } else {
            // No new image uploaded — keep the existing one
            unset($validated['featured_image']);
        }

        // Pull out projects before mass update
        $projectsJson = $validated['projects'] ?? null;
        unset($validated['projects']);

        $blog->update($validated);

        // Sync project detail rows (delete old, insert new)
        if ($projectsJson !== null) {
            $blog->projects()->delete();
            $projects = json_decode($projectsJson, true);
            if (is_array($projects)) {
                foreach ($projects as $i => $proj) {
                    $blog->projects()->create([
                        'promoter'          => $proj['promoter']          ?? null,
                        'products_capacity' => $proj['products_capacity'] ?? null,
                        'location'          => $proj['location']          ?? null,
                        'investment'        => $proj['investment']        ?? null,
                        'completion'        => $proj['completion']        ?? null,
                        'summary'           => $proj['summary']           ?? null,
                        'sort_order'        => $i,
                    ]);
                }
            }
        }

        return response()->json(['data' => $blog->load('projects')]);
    }

    // ── DELETE /api/blogs/{id} ────────────────────────────────────────────────
    public function destroy(Blog $blog): JsonResponse
    {
        // Remove featured image from storage
        if ($blog->featured_image) {
            Storage::disk('public')->delete($blog->featured_image);
        }

        // Deletes blog + cascades to blog_projects via foreign key
        $blog->delete();

        return response()->json(['message' => 'Blog deleted successfully.']);
    }
}
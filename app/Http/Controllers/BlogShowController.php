<?php

namespace App\Http\Controllers;

use App\Models\Blog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BlogShowController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request, string $slug)
    {
        $blog = Blog::with(['category', 'author'])
            ->where('slug', $slug)
            ->where('is_published', true)
            ->firstOrFail();

        // Get related articles
        $relatedBlogs = Blog::with(['category', 'media'])
            ->where('is_published', true)
            ->where('id', '!=', $blog->id)
            ->where('category_id', $blog->category_id)
            ->latest()
            ->take(2)
            ->get();

        return Inertia::render('blog/show', [
            'blog' => $blog->load('media'),
            'relatedBlogs' => $relatedBlogs,
        ]);
    }
}

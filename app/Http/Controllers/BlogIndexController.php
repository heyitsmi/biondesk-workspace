<?php

namespace App\Http\Controllers;

use App\Models\Blog;
use App\Models\BlogCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BlogIndexController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): Response
    {
        $categorySlug = $request->query('category');

        $blogsQuery = Blog::with(['category', 'author', 'media'])
            ->where('is_published', true)
            ->latest();

        if ($categorySlug) {
            $blogsQuery->whereHas('category', function ($query) use ($categorySlug) {
                $query->where('slug', $categorySlug);
            });
        }

        $blogs = $blogsQuery->paginate(12);

        $categories = BlogCategory::all();

        return Inertia::render('blog/index', [
            'blogs' => $blogs,
            'categories' => $categories,
            'currentCategory' => $categorySlug,
        ]);
    }
}

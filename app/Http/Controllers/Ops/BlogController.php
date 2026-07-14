<?php

namespace App\Http\Controllers\Ops;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Models\BlogCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class BlogController extends Controller
{
    public function index()
    {
        $blogs = Blog::with(['category', 'author'])->latest()->paginate(10);

        return Inertia::render('ops/blogs/index', [
            'blogs' => $blogs,
        ]);
    }

    public function create()
    {
        $categories = BlogCategory::all();

        return Inertia::render('ops/blogs/create-edit', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category_id' => ['nullable', 'exists:blog_categories,id'],
            'description' => ['nullable', 'string'],
            'content' => ['nullable', 'string'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string'],
            'is_published' => ['boolean'],
            'thumbnail' => ['nullable', 'image', 'max:2048'],
        ]);

        $validated['slug'] = Str::slug($validated['title']);
        $validated['user_id'] = $request->user()->id;

        $blog = Blog::create($validated);

        if ($request->hasFile('thumbnail')) {
            $blog->addMediaFromRequest('thumbnail')->toMediaCollection('thumbnail');
        }

        return redirect()->route('ops.blogs.index')->with('success', 'Blog created.');
    }

    public function edit(Blog $blog)
    {
        $categories = BlogCategory::all();

        return Inertia::render('ops/blogs/create-edit', [
            'blog' => $blog->load('media'),
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, Blog $blog)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category_id' => ['nullable', 'exists:blog_categories,id'],
            'description' => ['nullable', 'string'],
            'content' => ['nullable', 'string'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string'],
            'is_published' => ['boolean'],
            'thumbnail' => ['nullable', 'image', 'max:2048'],
        ]);

        $validated['slug'] = Str::slug($validated['title']);

        $blog->update($validated);

        if ($request->hasFile('thumbnail')) {
            $blog->addMediaFromRequest('thumbnail')->toMediaCollection('thumbnail');
        }

        return redirect()->route('ops.blogs.index')->with('success', 'Blog updated.');
    }

    public function destroy(Blog $blog)
    {
        $blog->delete();

        return redirect()->route('ops.blogs.index')->with('success', 'Blog deleted.');
    }
}

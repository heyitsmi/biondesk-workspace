<?php

namespace App\Http\Controllers\Ops;

use App\Http\Controllers\Controller;
use App\Models\BlogCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class BlogCategoryController extends Controller
{
    public function index()
    {
        $categories = BlogCategory::query()->latest()->paginate(10);

        return Inertia::render('ops/blog-categories/index', [
            'categories' => $categories,
        ]);
    }

    public function create()
    {
        return Inertia::render('ops/blog-categories/create-edit');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string'],
            'og_image' => ['nullable', 'image', 'max:2048'],
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        $category = BlogCategory::create($validated);

        if ($request->hasFile('og_image')) {
            $category->addMediaFromRequest('og_image')->toMediaCollection('og_image');
        }

        return redirect()->route('ops.blog-categories.index')->with('success', 'Blog category created.');
    }

    public function edit(BlogCategory $blogCategory)
    {
        return Inertia::render('ops/blog-categories/create-edit', [
            'category' => $blogCategory->load('media'),
        ]);
    }

    public function update(Request $request, BlogCategory $blogCategory)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string'],
            'og_image' => ['nullable', 'image', 'max:2048'],
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        $blogCategory->update($validated);

        if ($request->hasFile('og_image')) {
            $blogCategory->addMediaFromRequest('og_image')->toMediaCollection('og_image');
        }

        return redirect()->route('ops.blog-categories.index')->with('success', 'Blog category updated.');
    }

    public function destroy(BlogCategory $blogCategory)
    {
        $blogCategory->delete();

        return redirect()->route('ops.blog-categories.index')->with('success', 'Blog category deleted.');
    }
}

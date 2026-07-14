<?php

namespace App\Http\Controllers\Ops;

use App\Http\Controllers\Controller;
use App\Models\BlogCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BlogCategoryController extends Controller
{
    public function index(): Response
    {
        $categories = BlogCategory::query()->latest()->paginate(10);

        return Inertia::render('ops/blog-categories/index', [
            'categories' => $categories,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('ops/blog-categories/create-edit');
    }

    public function store(Request $request): RedirectResponse
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

    public function edit(BlogCategory $blogCategory): Response
    {
        return Inertia::render('ops/blog-categories/create-edit', [
            'category' => $blogCategory->load('media'),
        ]);
    }

    public function update(Request $request, BlogCategory $blogCategory): RedirectResponse
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

    public function destroy(BlogCategory $blogCategory): RedirectResponse
    {
        $blogCategory->delete();

        return redirect()->route('ops.blog-categories.index')->with('success', 'Blog category deleted.');
    }
}

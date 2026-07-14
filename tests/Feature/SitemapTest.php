<?php

use App\Models\Blog;
use App\Models\BlogCategory;
use App\Models\User;

test('sitemap xml contains canonical public pages and published blogs', function () {
    $user = User::factory()->create();
    $category = BlogCategory::create(['name' => 'Strategy', 'slug' => 'strategy']);

    $published = Blog::create([
        'user_id' => $user->id,
        'category_id' => $category->id,
        'title' => 'Published Post',
        'slug' => 'published-post',
        'is_published' => true,
        'updated_at' => now()->subDay(),
    ]);

    Blog::create([
        'user_id' => $user->id,
        'category_id' => $category->id,
        'title' => 'Draft Post',
        'slug' => 'draft-post',
        'is_published' => false,
    ]);

    $response = $this->get('/sitemap.xml');

    $response->assertSuccessful();
    $response->assertHeader('Content-Type', 'application/xml; charset=UTF-8');

    $xml = simplexml_load_string($response->getContent());

    expect($xml)->not->toBeFalse();

    $xml->registerXPathNamespace('sitemap', 'http://www.sitemaps.org/schemas/sitemap/0.9');
    $locations = collect($xml->xpath('//sitemap:loc'))->map(fn (SimpleXMLElement $location): string => (string) $location);
    $publishedUrl = route('blog.show', ['slug' => $published->slug]);

    expect($locations)
        ->toContain(route('home'))
        ->toContain(route('blog.index'))
        ->toContain($publishedUrl)
        ->not->toContain(route('blog.show', ['slug' => 'draft-post']));

    expect($response->getContent())->toContain('<lastmod>'.$published->updated_at->toDateString().'</lastmod>');
});

test('sitemap shortcut returns the same realtime xml', function () {
    $response = $this->get('/sitemap');

    $response->assertSuccessful();
    $response->assertHeader('Content-Type', 'application/xml; charset=UTF-8');
    expect($response->getContent())->toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
});

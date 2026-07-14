<?php

namespace App\Http\Controllers;

use App\Models\Blog;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use XMLWriter;

class SitemapController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): Response
    {
        $xml = new XMLWriter;
        $xml->openMemory();
        $xml->startDocument('1.0', 'UTF-8');
        $xml->startElement('urlset');
        $xml->writeAttribute('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');

        $this->writeUrl($xml, route('home'), '1.0');
        $this->writeUrl($xml, route('blog.index'), '0.8');

        Blog::query()
            ->select(['slug', 'updated_at'])
            ->where('is_published', true)
            ->orderBy('id')
            ->cursor()
            ->each(function (Blog $blog) use ($xml): void {
                $this->writeUrl(
                    $xml,
                    route('blog.show', ['slug' => $blog->slug]),
                    '0.7',
                    $blog->updated_at?->toDateString(),
                );
            });

        $xml->endElement();
        $xml->endDocument();

        return response($xml->outputMemory(), Response::HTTP_OK, [
            'Content-Type' => 'application/xml; charset=UTF-8',
        ]);
    }

    private function writeUrl(XMLWriter $xml, string $location, string $priority, ?string $lastModified = null): void
    {
        $xml->startElement('url');
        $xml->writeElement('loc', $location);

        if ($lastModified) {
            $xml->writeElement('lastmod', $lastModified);
        }

        $xml->writeElement('priority', $priority);
        $xml->endElement();
    }
}

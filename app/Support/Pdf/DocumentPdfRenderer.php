<?php

namespace App\Support\Pdf;

use Spatie\Browsershot\Browsershot;

class DocumentPdfRenderer
{
    /**
     * Render the given URL to PDF bytes via a headless browser.
     */
    public function render(string $url): string
    {
        return Browsershot::url($url)
            ->format('A4')
            ->showBackground()
            ->waitUntilNetworkIdle()
            ->pdf();
    }
}

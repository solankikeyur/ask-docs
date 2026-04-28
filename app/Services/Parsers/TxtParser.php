<?php

namespace App\Services\Parsers;

use App\Models\Document;
use App\Services\Contracts\DocumentParserStrategy;
use Illuminate\Support\Facades\Storage;

class TxtParser implements DocumentParserStrategy
{
    public function extractPages(Document $document): array
    {
        $content = Storage::disk(Document::storageDisk())->get($document->path);
        
        // Plain text doesn't have "pages", so we treat it as one page.
        // If it's very large, the chunker will handle the splitting later.
        return [
            [
                'page' => 1,
                'text' => $content
            ]
        ];
    }
}

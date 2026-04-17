<?php

namespace App\Services\Contracts;

use App\Models\Document;

interface DocumentParserStrategy
{
    /**
     * Extracts text from the document.
     * 
     * @param Document $document
     * @return array<int, array{page: int, text: string}>
     */
    public function extractPages(Document $document): array;
}

<?php

namespace App\Services;

use App\Models\Document;
use App\Services\Contracts\DocumentParserStrategy;
use App\Services\Parsers\PdfParser;
use App\Services\Parsers\DocxParser;
use Exception;
use Illuminate\Support\Facades\Log;

class DocumentParser
{
    protected Document $document;

    public function __construct(Document $document)
    {
        $this->document = $document;
    }

    public function extractText(): string
    {
        $pages = $this->extractPages();
        
        return collect($pages)->pluck('text')->implode(' ');
    }

    /**
     * Extracts text from the document, preserving page numbers (or simulated pages).
     * 
     * @return array<int, array{page: int, text: string}>
     */
    public function extractPages(): array
    {
        try {
            $strategy = $this->resolveStrategy();
            return $strategy->extractPages($this->document);
        } catch (Exception $e) {
            Log::error('DocumentParser: page extraction failed', [
                'document_id' => $this->document->id,
                'path'        => $this->document->path,
                'error'       => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    private function resolveStrategy(): DocumentParserStrategy
    {
        return match (strtoupper($this->document->type)) {
            'PDF'   => new PdfParser(),
            'DOCX', 'DOC' => new DocxParser(),
            default => throw new Exception("Unsupported document type: {$this->document->type}"),
        };
    }
}
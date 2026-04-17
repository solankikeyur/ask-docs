<?php

namespace App\Services\Parsers;

use App\Models\Document;
use App\Services\Contracts\DocumentParserStrategy;
use App\Services\Parsers\Concerns\DownloadsDocument;
use Illuminate\Support\Facades\Log;
use Smalot\PdfParser\Parser;

class PdfParser implements DocumentParserStrategy
{
    use DownloadsDocument;

    public function extractPages(Document $document): array
    {
        $localTempFile = $this->downloadToTemp($document, 'pdf_upload_');

        try {
            return $this->extractPagesFromLocalFile($document, $localTempFile);
        } finally {
            if (file_exists($localTempFile)) {
                unlink($localTempFile);
            }
        }
    }

    private function extractPagesFromLocalFile(Document $document, string $filePath): array
    {
        Log::info('DocumentParser: extracting pages using Smalot\\PdfParser', [
            'document_id' => $document->id,
        ]);

        $parser = new Parser();
        $pdf    = $parser->parseFile($filePath);
        $pages  = $pdf->getPages();
        
        $extracted = [];
        
        foreach ($pages as $index => $page) {
            $text = $page->getText();
            $text = trim((string) preg_replace('/\s+/', ' ', $text));
            
            if (empty($text)) {
                continue;
            }
            
            $extracted[] = [
                'page' => $index + 1,
                'text' => $text,
            ];
        }

        return $extracted;
    }
}

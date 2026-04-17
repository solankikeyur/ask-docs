<?php

namespace App\Services\Parsers;

use App\Models\Document;
use App\Services\Contracts\DocumentParserStrategy;
use App\Services\Parsers\Concerns\DownloadsDocument;
use Illuminate\Support\Facades\Log;
use PhpOffice\PhpWord\IOFactory;

class DocxParser implements DocumentParserStrategy
{
    use DownloadsDocument;

    // Grouping threshold (approximate characters per "page" since Word doesn't extract pages)
    private const CHARS_PER_PAGE = 3000;

    public function extractPages(Document $document): array
    {
        $localTempFile = $this->downloadToTemp($document, 'docx_upload_');

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
        Log::info('DocumentParser: extracting pages using PhpOffice\\PhpWord', [
            'document_id' => $document->id,
        ]);

        $phpWord = IOFactory::load($filePath);
        $fullText = '';

        foreach ($phpWord->getSections() as $section) {
            foreach ($section->getElements() as $element) {
                if (method_exists($element, 'getElements')) {
                    foreach ($element->getElements() as $subElement) {
                        if (method_exists($subElement, 'getText')) {
                            $fullText .= $subElement->getText() . ' ';
                        }
                    }
                } elseif (method_exists($element, 'getText')) {
                    $fullText .= $element->getText() . ' ';
                }
            }
        }

        // Clean up text
        $fullText = trim((string) preg_replace('/\s+/', ' ', $fullText));
        
        $extracted = [];
        $pageNumber = 1;
        $offset = 0;
        $length = strlen($fullText);

        if ($length === 0) {
            return [];
        }

        while ($offset < $length) {
            $chunk = substr($fullText, $offset, self::CHARS_PER_PAGE);
            
            // Try to align to word boundaries instead of cutting words in half
            if ($offset + self::CHARS_PER_PAGE < $length) {
                $lastSpace = strrpos($chunk, ' ');
                if ($lastSpace !== false) {
                    $chunk = substr($chunk, 0, $lastSpace);
                }
            }

            $extracted[] = [
                'page' => $pageNumber++,
                'text' => trim($chunk),
            ];

            $offset += strlen($chunk);
        }

        return $extracted;
    }
}

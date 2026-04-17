<?php

namespace App\Services;

use App\Models\Document;
use Exception;
use Illuminate\Support\Facades\Log;
use Smalot\PdfParser\Parser;

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
     * Extracts text from the document, preserving page numbers.
     * 
     * @return array<int, array{page: int, text: string}>
     */
    public function extractPages(): array
    {
        try {
            return match ($this->document->type) {
                'PDF'   => $this->parsePdfToPages(),
                default => throw new Exception("Unsupported document type: {$this->document->type}"),
            };
        } catch (Exception $e) {
            Log::error('DocumentParser: page extraction failed', [
                'document_id' => $this->document->id,
                'path'        => $this->document->path,
                'error'       => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    protected function parsePdfToPages(): array
    {
        $localTempFile = $this->downloadToTemp();

        try {
            return $this->extractPagesFromLocalFile($localTempFile);
        } finally {
            if (file_exists($localTempFile)) {
                unlink($localTempFile);
            }
        }
    }

    /**
     * Streams the document from its storage disk into /tmp and returns the temp path.
     */
    private function downloadToTemp(): string
    {
        $tempFile = tempnam(sys_get_temp_dir(), 'pdf_upload_');

        $stream = $this->document->readStream();

        if (! is_resource($stream)) {
            throw new Exception("Unable to open stream for document ID {$this->document->id}");
        }

        try {
            $dest = fopen($tempFile, 'wb');
            stream_copy_to_stream($stream, $dest);
        } finally {
            if (is_resource($stream)) {
                fclose($stream);
            }
            if (isset($dest) && is_resource($dest)) {
                fclose($dest);
            }
        }

        return $tempFile;
    }

    /**
     * Extract pages from a local filesystem path.
     * Uses Smalot\PdfParser for structured page extraction.
     */
    private function extractPagesFromLocalFile(string $filePath): array
    {
        Log::info('DocumentParser: extracting pages using Smalot\\PdfParser', [
            'document_id' => $this->document->id,
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
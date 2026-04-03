<?php

namespace App\Services;

use App\Models\Document;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
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
        try {
            return match ($this->document->type) {
                'PDF'   => $this->parsePdf(),
                default => throw new Exception("Unsupported document type: {$this->document->type}"),
            };
        } catch (Exception $e) {
            Log::error('DocumentParser: extraction failed', [
                'document_id' => $this->document->id,
                'path'        => $this->document->path,
                'error'       => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    protected function parsePdf(): string
    {
        $filePath   = Storage::disk('public')->path($this->document->path);
        $outputFile = tempnam(sys_get_temp_dir(), 'pdf_text_');

        // Try pdftotext (Poppler) — far more memory-efficient for large files.
        try {
            $command = sprintf(
                'pdftotext %s %s',
                escapeshellarg($filePath),
                escapeshellarg($outputFile)
            );

            exec($command, $output, $returnCode);

            if ($returnCode === 0 && file_exists($outputFile)) {
                try {
                    $text = file_get_contents($outputFile);
                } finally {
                    // Always remove the temp file, even if reading failed.
                    if (file_exists($outputFile)) {
                        unlink($outputFile);
                    }
                }

                return trim((string) preg_replace('/\s+/', ' ', $text));
            }
        } catch (Exception $e) {
            Log::warning('DocumentParser: pdftotext failed, falling back to Smalot\PdfParser', [
                'error' => $e->getMessage(),
            ]);
        } finally {
            // Safety net: remove temp file if pdftotext didn't produce valid output.
            if (file_exists($outputFile)) {
                unlink($outputFile);
            }
        }

        // Fallback: Smalot\PdfParser (PHP-native, fine for smaller files).
        $parser = new Parser();
        $pdf    = $parser->parseFile($filePath);
        $text   = $pdf->getText();

        return trim((string) preg_replace('/\s+/', ' ', $text));
    }
}
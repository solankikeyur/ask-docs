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
        // Download the file from whichever storage disk is configured (local, S3, R2…)
        // into a local temp file. This allows all downstream parsers (pdftotext, Smalot)
        // to work on a real local path regardless of where the file actually lives.
        $localTempFile = $this->downloadToTemp();

        try {
            $text = $this->extractTextFromLocalFile($localTempFile);
        } finally {
            // Always clean up the temp file, even if parsing throws.
            if (file_exists($localTempFile)) {
                unlink($localTempFile);
            }
        }

        return $text;
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
     * Extract text from a local filesystem path.
     * Tries pdftotext (Poppler) first — memory-efficient for large files.
     * Falls back to Smalot\PdfParser (PHP-native) if pdftotext is unavailable.
     */
    private function extractTextFromLocalFile(string $filePath): string
    {
        // ── Attempt 1: pdftotext (Poppler CLI) ──────────────────────────────
        $outputFile = tempnam(sys_get_temp_dir(), 'pdf_text_');

        try {
            // Suppress stderr cross-platform: NUL on Windows, /dev/null on Unix.
            $nullDevice = PHP_OS_FAMILY === 'Windows' ? 'NUL' : '/dev/null';
            $command    = sprintf(
                'pdftotext %s %s 2>%s',
                escapeshellarg($filePath),
                escapeshellarg($outputFile),
                $nullDevice
            );
            exec($command, $output, $returnCode);

            if ($returnCode === 0 && file_exists($outputFile) && filesize($outputFile) > 0) {
                $text = file_get_contents($outputFile);
                return trim((string) preg_replace('/\s+/', ' ', $text));
            }
        } catch (Exception $e) {
            Log::warning('DocumentParser: pdftotext failed, falling back to Smalot\\PdfParser', [
                'document_id' => $this->document->id,
                'error'       => $e->getMessage(),
            ]);
        } finally {
            if (file_exists($outputFile)) {
                unlink($outputFile);
            }
        }

        // ── Attempt 2: Smalot\PdfParser (PHP-native fallback) ───────────────
        Log::info('DocumentParser: using Smalot\\PdfParser fallback', [
            'document_id' => $this->document->id,
        ]);

        $parser = new Parser();
        $pdf    = $parser->parseFile($filePath);
        $text   = $pdf->getText();

        return trim((string) preg_replace('/\s+/', ' ', $text));
    }
}
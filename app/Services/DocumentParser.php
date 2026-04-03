<?php

namespace App\Services;

use App\Models\Document;
use Exception;
use Log;
use Smalot\PdfParser\Parser;
use Storage;

class DocumentParser
{
    protected $document;

    public function __construct(Document $document)
    {
        $this->document = $document;
    }

    public function extractText()
    {
        try {

            $documentType = $this->document->type;

            switch ($documentType) {
                case "PDF":
                    return $this->parsePdf();
                default:
                    throw new Exception("Unsupported document provided");
            }

        } catch (Exception $e) {
            Log::error("Error while parsing document: ", ["error" => $e->getMessage(), "id" => $this->document->id, "path" => $this->document->path]);
            throw new Exception($e->getMessage());
        }
    }

    protected function parsePdf()
    {
        $filePath = Storage::disk("public")->path($this->document->path);

        // Try extracting using pdftotext (Poppler Utils) - much more memory efficient for large files
        try {
            $outputFile = tempnam(sys_get_temp_dir(), 'pdf_text_');
            $command = sprintf('pdftotext "%s" "%s"', $filePath, $outputFile);
            
            exec($command, $output, $returnVar);

            if ($returnVar === 0 && file_exists($outputFile)) {
                $text = file_get_contents($outputFile);
                unlink($outputFile);
                $text = preg_replace('/\s+/', ' ', $text);
                return trim($text);
            }
        } catch (Exception $e) {
            Log::warning("pdftotext failed, falling back to Smalot\PdfParser: " . $e->getMessage());
        }

        // Fallback to Smalot\PdfParser if pdftotext fails
        $parser = new Parser();
        $pdf = $parser->parseFile($filePath);
        $text = $pdf->getText();
        $text = preg_replace('/\s+/', ' ', $text);
        return trim($text);
    }

}
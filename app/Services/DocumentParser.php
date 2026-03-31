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
        $parser = new Parser();
        $filePath = Storage::disk("public")->path($this->document->path);
        $pdf = $parser->parseFile($filePath);
        $text = $pdf->getText();
        $text = preg_replace('/\s+/', ' ', $text);
        return trim($text);
    }

}
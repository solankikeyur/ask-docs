<?php

namespace App\Services;

class TextChunker
{
    /**
     * Chunk the text into smaller segments with optional overlap.
     * 
     * @param string $text The text to chunk.
     * @param int $chunkSize The size of each chunk.
     * @param int $chunkOverlap The overlap between consecutive chunks.
     * @return array An array of text chunks.
     */
    public function chunk(string $text, int $chunkSize = 1000, int $chunkOverlap = 100): array
    {
        if (empty($text)) {
            return [];
        }

        $text = $this->cleanText($text);
        $chunks = [];
        $textLength = mb_strlen($text);

        if ($textLength <= $chunkSize) {
            return [$text];
        }

        $step = $chunkSize - $chunkOverlap;
        
        // Ensure we always move forward
        if ($step <= 0) {
            $step = $chunkSize;
        }

        for ($i = 0; $i < $textLength; $i += $step) {
            $chunk = mb_substr($text, $i, $chunkSize);
            $chunks[] = $chunk;

            // If we've reached or passed the end of the string, stop.
            if ($i + $chunkSize >= $textLength) {
                break;
            }
        }

        return $chunks;
    }

    /**
     * Basic text cleaning to normalize whitespace.
     * 
     * @param string $text
     * @return string
     */
    protected function cleanText(string $text): string
    {
        // Replace multiple spaces/newlines with a single space
        return preg_replace('/\s+/', ' ', trim($text));
    }
}

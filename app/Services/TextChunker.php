<?php

namespace App\Services;

class TextChunker
{
    /**
     * Chunk the text on sentence boundaries with optional overlap.
     *
     * Unlike a simple character-based sliding window, this strategy respects
     * natural language structure so embeddings capture coherent ideas rather
     * than arbitrary byte sequences.
     *
     * @param  string  $text          The text to chunk.
     * @param  int     $chunkSize     Target character size per chunk.
     * @param  int     $chunkOverlap  Overlap carried from the previous chunk (in chars).
     * @return string[]
     */
    public function chunk(string $text, int $chunkSize = 1000, int $chunkOverlap = 150): array
    {
        $text = $this->cleanText($text);

        if (empty($text)) {
            return [];
        }

        if (mb_strlen($text) <= $chunkSize) {
            return [$text];
        }

        // Split on sentence-ending punctuation followed by whitespace, or on paragraph breaks.
        $sentences = preg_split(
            '/(?<=[.?!。])\s+|\n{2,}/',
            $text,
            -1,
            PREG_SPLIT_NO_EMPTY
        );

        if (empty($sentences)) {
            return [$text];
        }

        $chunks  = [];
        $current = '';

        foreach ($sentences as $sentence) {
            $sentence = trim($sentence);

            if ($sentence === '') {
                continue;
            }

            $wouldBe = $current === ''
                ? $sentence
                : $current . ' ' . $sentence;

            if (mb_strlen($wouldBe) > $chunkSize && $current !== '') {
                // Flush the current chunk.
                $chunks[] = trim($current);

                // Carry the last $chunkOverlap characters of the flushed chunk
                // into the next one so context is not lost at boundaries.
                $overlap = mb_strlen($current) > $chunkOverlap
                    ? mb_substr($current, -$chunkOverlap)
                    : $current;

                $current = trim($overlap) . ' ' . $sentence;
            } else {
                $current = $wouldBe;
            }

            // A single sentence that is itself longer than $chunkSize: hard-split it.
            if (mb_strlen($current) > $chunkSize * 2) {
                $hardChunks = $this->hardSplit($current, $chunkSize, $chunkOverlap);
                $last       = array_pop($hardChunks);
                $chunks     = array_merge($chunks, $hardChunks);
                $current    = $last ?? '';
            }
        }

        if (trim($current) !== '') {
            $chunks[] = trim($current);
        }

        return array_values(array_filter($chunks));
    }

    /**
     * Fall-back character-level split for extremely long single sentences.
     *
     * @return string[]
     */
    protected function hardSplit(string $text, int $chunkSize, int $overlap): array
    {
        $chunks     = [];
        $textLength = mb_strlen($text);
        $step       = max(1, $chunkSize - $overlap);

        for ($i = 0; $i < $textLength; $i += $step) {
            $chunks[] = mb_substr($text, $i, $chunkSize);

            if ($i + $chunkSize >= $textLength) {
                break;
            }
        }

        return $chunks;
    }

    /**
     * Normalize whitespace and trim the text.
     */
    protected function cleanText(string $text): string
    {
        // Collapse runs of horizontal whitespace to a single space,
        // but preserve paragraph separators (double newlines).
        $text = preg_replace('/[^\S\n]+/', ' ', $text);
        $text = preg_replace('/\n{3,}/', "\n\n", $text);

        return trim($text);
    }
}

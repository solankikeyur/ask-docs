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
        $chunks = $this->chunkWithPages([['page' => 1, 'text' => $text]], $chunkSize, $chunkOverlap);
        
        return collect($chunks)->pluck('content')->toArray();
    }

    /**
     * Chunk the text while preserving page attribution.
     * 
     * @param  array<int, array{page: int, text: string}> $pages
     * @return array<int, array{content: string, page: int}>
     */
    public function chunkWithPages(array $pages, int $chunkSize = 1000, int $chunkOverlap = 150): array
    {
        $allChunks = [];
        $current = '';
        $currentPage = null;

        foreach ($pages as $page) {
            $text = $this->cleanText($page['text']);
            if (empty($text)) continue;
            
            if ($currentPage === null) $currentPage = $page['page'];

            // Split on sentence-ending punctuation or paragraph breaks
            $sentences = preg_split('/(?<=[.?!。])\s+|\n{2,}/', $text, -1, PREG_SPLIT_NO_EMPTY);

            foreach ($sentences as $sentence) {
                $sentence = trim($sentence);
                if ($sentence === '') continue;

                $wouldBe = $current === '' ? $sentence : $current . ' ' . $sentence;

                if (mb_strlen($wouldBe) > $chunkSize && $current !== '') {
                    // Flush current chunk
                    $allChunks[] = [
                        'content' => trim($current),
                        'page' => $currentPage
                    ];

                    // Carry overlap
                    $overlap = mb_strlen($current) > $chunkOverlap
                        ? mb_substr($current, -$chunkOverlap)
                        : $current;

                    $current = trim($overlap) . ' ' . $sentence;
                    // For the next chunk, we associate it with the page where the most recent sentence started
                    $currentPage = $page['page'];
                } else {
                    $current = $wouldBe;
                    if ($currentPage === null) $currentPage = $page['page'];
                }

                // Handle runaway single sentences
                if (mb_strlen($current) > $chunkSize * 2) {
                    $hardChunks = $this->hardSplit($current, $chunkSize, $chunkOverlap);
                    $last = array_pop($hardChunks);
                    foreach ($hardChunks as $hc) {
                        $allChunks[] = [
                            'content' => $hc,
                            'page' => $currentPage
                        ];
                    }
                    $current = $last ?? '';
                }
            }
        }

        if (trim($current) !== '') {
            $allChunks[] = [
                'content' => trim($current),
                'page' => $currentPage
            ];
        }

        return $allChunks;
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

<?php

namespace App\Services;

use App\Ai\Agents\AskDoc;
use App\Contracts\DocumentContextSource;
use App\Models\DocumentChunk;
use Illuminate\Support\Facades\Cache;
use Laravel\Ai\Embeddings;
use Laravel\Ai\Enums\Lab;

class AiChatService
{
    /**
     * The model to use for the AI completion.
     */
    protected string $completionModel = 'gpt-4o-mini-2024-07-18';

    /**
     * The model to use for embeddings.
     */
    protected string $embeddingModel = 'text-embedding-3-small';

    /**
     * The dimensions for the embeddings.
     */
    protected int $embeddingDimensions = 1536;

    /**
     * Cosine-similarity floor for vector search.
     *
     * Raised from 0.2 → 0.5.  With text-embedding-3-small a value below ~0.4
     * is close to noise and drags in irrelevant chunks, hurting answer quality.
     */
    protected float $similarityThreshold = 0.3;

    /**
     * How many candidates to fetch from vector search before reranking.
     */
    protected int $rerankCandidateLimit = 25;

    /**
     * How many chunks to include in the final context.
     */
    protected int $contextChunkLimit = 10;

    protected CohereService $cohere;

    public function __construct(
        protected DocumentContextSource $source
    ) {
        $this->cohere = new CohereService();
    }

    /**
     * Generate a streamed answer for the given message using the document context.
     *
     * @return array{stream: \Laravel\Ai\Responses\StreamableAgentResponse, citations: array}
     */
    public function streamAnswer(string $message)
    {
        $contextResult = $this->getDocContext($message);

        $prompt = sprintf("Question: %s\n\nContext:\n%s", $message, $contextResult['context']);

        $stream = (new AskDoc($this->source))->stream(
            $prompt,
            model: $this->completionModel,
            provider: Lab::OpenAI,
            timeout: 120
        );

        return [
            'stream' => $stream,
            'citations' => $contextResult['citations']
        ];
    }

    /**
     * Retrieve the most relevant document chunks for the given message.
     *
     * @return array{context: string, citations: array}
     */
    public function getDocContext(string $message): array
    {
        $vector = $this->getQueryEmbedding($message);

        $documentIds = $this->source->getAssignedDocumentIds();

        if (empty($documentIds)) {
            return [
                'context' => '(No documents assigned to this context source)',
                'citations' => []
            ];
        }

        $similarChunks = DocumentChunk::with('document')
            ->whereIn('document_id', $documentIds)
            ->whereVectorSimilarTo('embedding', $vector, $this->similarityThreshold)
            ->limit($this->rerankCandidateLimit)
            ->get();

        if ($similarChunks->isEmpty()) {
            return [
                'context' => '',
                'citations' => []
            ];
        }

        $reranked = $this->cohere->rerank($message, $similarChunks, $this->contextChunkLimit);

        $relevantChunks = $reranked->take($this->contextChunkLimit);

        $contextParts = [];
        $citations = [];

        foreach ($relevantChunks as $index => $chunk) {
            $docName = $chunk->document->name;
            $page = $chunk->metadata['page'] ?? 'n/a';

            $contextParts[] = sprintf(
                "[p. %s] (File: %s):\n%s",
                $page,
                $docName,
                $chunk->content
            );

            $citations[] = [
                'document_name' => $docName,
                'page_number' => $page,
            ];
        }

        return [
            'context' => implode("\n\n---\n\n", $contextParts),
            'citations' => $citations
        ];
    }

    /**
     * Fetch the embedding vector for a query string, with a 1-hour cache.
     *
     * @return float[]
     */
    protected function getQueryEmbedding(string $message): array
    {
        $cacheKey = 'query_embedding:' . $this->embeddingModel . ':' . sha1($message);

        return Cache::remember($cacheKey, now()->addHour(), function () use ($message) {
            return Embeddings::for([$message])
                ->dimensions($this->embeddingDimensions)
                ->generate(Lab::OpenAI, $this->embeddingModel)
                ->embeddings[0];
        });
    }

    /**
     * Filter the results of a RAG query to include only those actually cited in the response text.
     * Also groups citations by document for clean storage/display.
     *
     * @param string $text The AI response text containing [p. X] markers.
     * @param array $rawCitations The full list of potential citations retrieved.
     * @return array Processed and grouped citations.
     */
    public function filterUsedCitations(string $text, array $rawCitations): array
    {
        // 1. Extract cited page numbers from text using regex [p. 1], [p. 2], etc.
        preg_match_all('/\[p\. (\d+)\]/', $text, $matches);
        $usedPages = array_unique($matches[1]);

        if (empty($usedPages)) {
            return [];
        }

        // 2. Filter raw citations - if a source has a page number that was cited, include it
        $usedCitations = array_filter($rawCitations, function ($cite) use ($usedPages) {
            return in_array($cite['page_number'] ?? '', $usedPages);
        });

        // 3. Group by document name
        $grouped = [];
        foreach ($usedCitations as $cite) {
            $doc = $cite['document_name'];
            $page = $cite['page_number'];

            if (!isset($grouped[$doc])) {
                $grouped[$doc] = [];
            }
            if (!in_array($page, $grouped[$doc])) {
                $grouped[$doc][] = $page;
            }
        }

        // 4. Format for storage
        $final = [];
        foreach ($grouped as $doc => $pages) {
            sort($pages, SORT_NATURAL);
            $final[] = [
                'document_name' => $doc,
                'pages' => $pages,
            ];
        }

        return $final;
    }
}

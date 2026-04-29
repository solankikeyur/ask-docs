<?php

namespace App\Services;

use App\Actions\Chat\GetRerankedContextAction;
use App\Ai\Agents\AskDoc;
use App\Contracts\DocumentContextSource;
use Laravel\Ai\Enums\Lab;
use Log;

class AiChatService
{
    /**
     * The model to use for the AI completion.
     */
    protected string $completionModel;

    /**
     * The model to use for embeddings.
     */
    protected string $embeddingModel;

    /**
     * The dimensions for the embeddings.
     */
    protected int $embeddingDimensions;

    /**
     * Cosine-similarity floor for vector search.
     */
    protected float $similarityThreshold;

    /**
     * How many candidates to fetch from vector search before reranking.
     */
    protected int $rerankCandidateLimit;

    /**
     * How many chunks to include in the final context.
     */
    protected int $contextChunkLimit;

    /**
     * Minimum relevance score for reranked results.
     */
    protected float $rerankScoreThreshold;

    protected CohereService $cohere;

    public function __construct(
        protected DocumentContextSource $source,
        protected GetRerankedContextAction $getRerankedContext
    ) {
        $this->cohere = new CohereService();
        
        $this->completionModel = config('ai.rag.models.completion');
        $this->embeddingModel = config('ai.rag.models.embedding');
        $this->embeddingDimensions = config('ai.rag.retrieval.dimensions');
        $this->similarityThreshold = config('ai.rag.retrieval.similarity_threshold');
        $this->rerankCandidateLimit = config('ai.rag.retrieval.candidate_limit');
        $this->contextChunkLimit = config('ai.rag.retrieval.context_limit');
        $this->rerankScoreThreshold = config('ai.rag.rerank.score_threshold', 0.3);
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
            timeout: config('ai.rag.timeouts.completion', 20)
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
        $relevantChunks = $this->getRerankedContext->execute(
            message: $message,
            source: $this->source,
            chunkLimit: $this->contextChunkLimit,
            candidateLimit: $this->rerankCandidateLimit,
            similarityThreshold: $this->similarityThreshold,
            rerankScoreThreshold: $this->rerankScoreThreshold
        );

        if ($relevantChunks->isEmpty()) {
            return [
                'context' => '',
                'citations' => []
            ];
        }

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

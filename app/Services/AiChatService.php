<?php

namespace App\Services;

use App\Ai\Agents\AskDoc;
use App\Models\Chat;
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
        protected Chat $chat
    ) {
        $this->cohere = new CohereService();
    }

    /**
     * Generate a streamed answer for the given message using the document context.
     *
     * @return \Laravel\Ai\Responses\StreamableAgentResponse
     */
    public function streamAnswer(string $message)
    {
        $context = $this->getDocContext($message);

        $prompt = sprintf("Question: %s\n\nContext:\n%s", $message, $context);

        return (new AskDoc($this->chat))->stream(
            $prompt,
            model: $this->completionModel,
            provider: Lab::OpenAI,
            timeout: 120
        );
    }

    /**
     * Retrieve the most relevant document chunks for the given message.
     *
     * Query embeddings are cached for 1 hour so repeated or near-identical questions
     * do not make a redundant API call to OpenAI.
     */
    public function getDocContext(string $message): string
    {
        $vector = $this->getQueryEmbedding($message);

        $similarChunks = DocumentChunk::query()
            ->where('document_id', $this->chat->document_id)
            ->whereVectorSimilarTo('embedding', $vector, $this->similarityThreshold)
            ->limit($this->rerankCandidateLimit)
            ->get();

        $reranked = $this->cohere->rerank($message, $similarChunks, $this->contextChunkLimit);

        return $reranked
            ->take($this->contextChunkLimit)
            ->pluck('content')
            ->implode("\n\n");
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
}

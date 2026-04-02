<?php

namespace App\Services;

use App\Ai\Agents\AskDoc;
use App\Models\Chat;
use App\Models\DocumentChunk;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Ai\Embeddings;
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Messages\Message;

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
     * The similarity threshold for the vector search.
     */
    protected float $similarityThreshold = 0.2;

    /**
     * How many candidates to fetch from vector search before reranking.
     */
    protected int $rerankCandidateLimit = 25;

    /**
     * How many chunks to include in the final context.
     */
    protected int $contextChunkLimit = 10;

    public function __construct(
        protected Chat $chat,
        protected CohereService $cohere
    ) {
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
     */
    public function getDocContext(string $message): string
    {
        $embeddings = Embeddings::for([$message])
            ->dimensions($this->embeddingDimensions)
            ->generate(Lab::OpenAI, $this->embeddingModel);

        $similarChunks = DocumentChunk::query()
            ->where('document_id', $this->chat->document_id)
            ->whereVectorSimilarTo('embedding', $embeddings->embeddings[0], $this->similarityThreshold)
            ->limit($this->rerankCandidateLimit)
            ->get();

        $reranked = $this->cohere->rerank($message, $similarChunks, $this->contextChunkLimit);

        return $reranked
            ->take($this->contextChunkLimit)
            ->pluck('content')
            ->implode("\n\n");
    }


    /**
     * Get the formatted conversation messages.
     * 
     * @return array<int, Message>
     */
    public function getMessages(): array
    {
        return $this->chat->messages()
            ->latest('id')
            ->limit(50)
            ->get()
            ->reverse()
            ->map(fn($message) => new Message($message->role, $message->content))
            ->values()
            ->all();
    }
}

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

    /**
     * Safety limit to keep rerank payloads small.
     */
    protected int $cohereMaxCharsPerChunk = 1000;

    public function __construct(
        protected Chat $chat
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

        $reranked = $this->rerankWithCohere($message, $similarChunks);

        return $reranked
            ->take($this->contextChunkLimit)
            ->pluck('content')
            ->implode("\n\n");
    }

    /**
     * Rerank candidate chunks with Cohere (optional).
     *
     * If `COHERE_API_KEY` isn't set or the call fails, this returns the original ordering.
     */
    private function rerankWithCohere(string $query, $chunks)
    {
        $apiKey = (string) config('services.cohere.key');

        if ($apiKey === '' || $chunks->isEmpty()) {
            return $chunks;
        }

        $model = (string) config('services.cohere.rerank_model', 'rerank-v4.0-fast');

        // Keep payload small and stable for caching.
        $documents = $chunks
            ->pluck('content')
            ->map(fn($content) => Str::limit((string) $content, $this->cohereMaxCharsPerChunk, ''))
            ->values()
            ->all();

        $cacheKey = 'cohere:rerank:v2:' . sha1($model . '|' . $query . '|' . implode('|', $chunks->pluck('id')->map(fn($id) => (string) $id)->all()));

        $results = Cache::remember($cacheKey, now()->addMinutes(10), function () use ($apiKey, $model, $query, $documents) {
            try {
                $response = Http::withToken($apiKey)
                    ->acceptJson()
                    ->timeout(8)
                    ->retry(2, 200)
                    ->post('https://api.cohere.com/v2/rerank', [
                        'model' => $model,
                        'query' => $query,
                        'documents' => $documents,
                        'top_n' => min($this->contextChunkLimit, count($documents)),
                    ]);

                if (!$response->successful()) {
                    return null;
                }
                return $response->json('results');
            } catch (ConnectionException) {
                return null;
            }
        });

        if (!is_array($results) || $results === []) {
            return $chunks;
        }

        // Cohere returns an ordered list of { index, relevance_score }.
        $ordered = collect();

        foreach ($results as $item) {
            $index = is_array($item) ? ($item['index'] ?? null) : null;
            if (!is_int($index)) {
                continue;
            }

            if (!isset($chunks[$index])) {
                continue;
            }

            $ordered->push($chunks[$index]);
        }

        // If something went wrong with indexing, fall back safely.
        return $ordered->isEmpty() ? $chunks : $ordered;
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

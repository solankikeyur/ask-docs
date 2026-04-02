<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class CohereService
{
    /**
     * The Cohere API endpoint for reranking.
     */
    private const RERANK_URL = 'https://api.cohere.com/v2/rerank';

    /**
     * Safety limit to keep rerank payloads small.
     */
    protected int $maxCharsPerChunk = 1000;

    /**
     * The Cohere API key.
     */
    protected string $apiKey;

    /**
     * The default model to use for reranking.
     */
    protected string $model;

    public function __construct()
    {
        $this->apiKey = (string) config('services.cohere.key');
        $this->model = (string) config('services.cohere.rerank_model', 'rerank-v4.0-fast');
    }

    /**
     * Rerank candidate chunks with Cohere.
     *
     * If `COHERE_API_KEY` isn't set or the call fails, this returns the original ordering.
     */
    public function rerank(string $query, Collection|array $chunks, int $limit = 10): Collection
    {
        $chunks = collect($chunks);

        if ($this->apiKey === '' || $chunks->isEmpty()) {
            return $chunks;
        }

        // Keep payload small and stable for caching.
        $documents = $chunks
            ->pluck('content')
            ->map(fn($content) => Str::limit((string) $content, $this->maxCharsPerChunk, ''))
            ->values()
            ->all();

        $cacheKey = 'cohere:rerank:v2:' . sha1($this->model . '|' . $query . '|' . implode('|', $chunks->pluck('id')->map(fn($id) => (string) $id)->all()));

        $results = Cache::remember($cacheKey, now()->addMinutes(10), function () use ($query, $documents, $limit) {
            try {
                $response = Http::withToken($this->apiKey)
                    ->acceptJson()
                    ->timeout(8)
                    ->retry(2, 200)
                    ->post(self::RERANK_URL, [
                        'model' => $this->model,
                        'query' => $query,
                        'documents' => $documents,
                        'top_n' => min($limit, count($documents)),
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

            if (!is_int($index) || !$chunks->has($index)) {
                continue;
            }

            $ordered->push($chunks[$index]);
        }

        // If something went wrong with indexing, fall back safely.
        return $ordered->isEmpty() ? $chunks : $ordered;
    }
}

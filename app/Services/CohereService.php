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
     * Safety limit to keep rerank payloads small.
     */
    protected int $maxCharsPerChunk = 1000;

    /**
     * Rerank candidate chunks with Cohere.
     *
     * If `COHERE_API_KEY` isn't set or the call fails, this returns the original ordering.
     */
    public function rerank(string $query, Collection|array $chunks, int $limit = 10): Collection
    {
        $chunks = collect($chunks);

        $apiKey = (string) config('services.cohere.key');

        if ($apiKey === '' || $chunks->isEmpty()) {
            return $chunks;
        }

        $model = (string) config('services.cohere.rerank_model', 'rerank-v4.0-fast');

        // Keep payload small and stable for caching.
        $documents = $chunks
            ->pluck('content')
            ->map(fn($content) => Str::limit((string) $content, $this->maxCharsPerChunk, ''))
            ->values()
            ->all();

        $cacheKey = 'cohere:rerank:v2:' . sha1($model . '|' . $query . '|' . implode('|', $chunks->pluck('id')->map(fn($id) => (string) $id)->all()));

        $results = Cache::remember($cacheKey, now()->addMinutes(10), function () use ($apiKey, $model, $query, $documents, $limit) {
            try {
                $response = Http::withToken($apiKey)
                    ->acceptJson()
                    ->timeout(8)
                    ->retry(2, 200)
                    ->post('https://api.cohere.com/v2/rerank', [
                        'model' => $model,
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
            if (!is_int($index)) {
                continue;
            }

            if (!$chunks->has($index)) {
                continue;
            }

            $ordered->push($chunks[$index]);
        }

        // If something went wrong with indexing, fall back safely.
        return $ordered->isEmpty() ? $chunks : $ordered;
    }
}

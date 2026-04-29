<?php

declare(strict_types=1);

namespace App\Actions\Chat;

use App\Ai\Agents\ExpandQuery;
use App\Contracts\DocumentContextSource;
use App\Models\DocumentChunk;
use App\Services\CohereService;
use Illuminate\Support\Collection;
use Laravel\Ai\Embeddings;
use Laravel\Ai\Enums\Lab;

final readonly class GetRerankedContextAction
{
    public function __construct(
        private CohereService $cohere,
    ) {
    }

    /**
     * Orchestrate the retrieval pipeline: Expand -> Embed -> Search -> Deduplicate -> Rerank.
     *
     * @return Collection<int, DocumentChunk>
     */
    public function execute(
        string $message,
        DocumentContextSource $source,
        int $chunkLimit = 10,
        int $candidateLimit = 25,
        float $similarityThreshold = 0.3
    ): Collection {
        // 1. Expand Query
        $variations = (new ExpandQuery())->prompt($message, provider: Lab::OpenAI, model: 'gpt-4o-mini-2024-07-18', timeout: 120);
        $allQueries = array_unique(array_filter(array_merge([$message], $variations['queries'] ?? [])));

        // 2. Batch Get Embeddings
        $embeddingModel = 'text-embedding-3-small';
        $dimensions = 1536;

        $embeddingsResponse = Embeddings::for($allQueries)
            ->dimensions($dimensions)
            ->generate(Lab::OpenAI, $embeddingModel);

        $documentIds = $source->getAssignedDocumentIds();

        if (empty($documentIds)) {
            return collect();
        }

        $allCandidates = collect();

        // 3. Semantic Search candidates (All vectors at once)
        $semanticChunks = DocumentChunk::with('document')
            ->whereIn('document_id', $documentIds)
            ->where(function ($q) use ($embeddingsResponse, $similarityThreshold) {
                foreach ($embeddingsResponse->embeddings as $vector) {
                    if ($vector) {
                        $q->orWhere(fn($sub) => $sub->whereVectorSimilarTo('embedding', $vector, $similarityThreshold));
                    }
                }
            })
            ->limit(100)
            ->get();

        // 4. Keyword Search candidates (All queries at once)
        $keywordChunks = DocumentChunk::with('document')
            ->whereIn('document_id', $documentIds)
            ->where(function ($q) use ($allQueries) {
                foreach ($allQueries as $query) {
                    $q->orWhereRaw("to_tsvector('english', content) @@ plainto_tsquery('english', ?)", [$query]);
                }
            })
            ->limit(100)
            ->get();

        $allCandidates = $semanticChunks->merge($keywordChunks);


        // 4. Deduplicate
        $uniqueCandidates = $allCandidates->unique('id')->values();

        if ($uniqueCandidates->isEmpty()) {
            return collect();
        }

        // 5. Rerank against ORIGINAL message
        // This ensures that even if we expanded, we still prioritize what the user actually asked.
        return $this->cohere->rerank($message, $uniqueCandidates, $chunkLimit);
    }
}

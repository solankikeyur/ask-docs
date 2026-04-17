<?php

namespace App\Jobs;

use App\Models\Document;
use App\Models\DocumentChunk;
use App\Services\DocumentParser;
use App\Services\TextChunker;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Laravel\Ai\Embeddings;
use Laravel\Ai\Enums\Lab;

class ProcessDocument implements ShouldQueue
{
    use Queueable;

    /**
     * Maximum number of attempts before the job is marked as failed.
     */
    public int $tries = 3;

    /**
     * Maximum seconds the job may run before it is killed.
     */
    public int $timeout = 300;

    /**
     * Seconds to wait before retrying after a failure.
     */
    public int $backoff = 60;

    /**
     * Create a new job instance.
     */
    public function __construct(public Document $document)
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(TextChunker $textChunker): void
    {
        $documentParser = new DocumentParser($this->document);
        $pages = $documentParser->extractPages();

        $chunks = $textChunker->chunkWithPages($pages);

        if (empty($chunks)) {
            Log::warning('ProcessDocument: no chunks extracted', [
                'document_id' => $this->document->id,
            ]);
            $this->document->update(['status' => Document::STATUS_FAILED]);
            return;
        }

        $allRows = [];
        $batchSize = 100;

        foreach (array_chunk($chunks, $batchSize) as $batchIndex => $batch) {
            $contents = collect($batch)->pluck('content')->toArray();
            
            $response = Embeddings::for($contents)
                ->dimensions(1536)
                ->generate(Lab::OpenAI, 'text-embedding-3-small');

            $now = now();
            foreach ($batch as $indexInBatch => $chunkData) {
                $allRows[] = [
                    'document_id' => $this->document->id,
                    'content' => $chunkData['content'],
                    'embedding' => json_encode($response->embeddings[$indexInBatch]),
                    'chunk_index' => ($batchIndex * $batchSize) + $indexInBatch,
                    'metadata' => json_encode(['page' => $chunkData['page']]),
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        DB::transaction(function () use ($allRows) {
            // Wipe any stale chunks from a previous failed attempt so retries are idempotent.
            $this->document->chunks()->delete();

            // Bulk-insert the prepared rows in batches for performance.
            foreach (array_chunk($allRows, 100) as $rowBatch) {
                DocumentChunk::insert($rowBatch);
            }

            $this->document->update(['status' => Document::STATUS_READY]);
        });
    }

    /**
     * Handle a job failure — mark the document permanently as failed.
     */
    public function failed(\Throwable $e): void
    {
        Log::error('ProcessDocument failed', [
            'document_id' => $this->document->id,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ]);

        $this->document->update(['status' => Document::STATUS_FAILED]);
    }
}

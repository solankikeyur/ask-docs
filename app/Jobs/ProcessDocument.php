<?php

namespace App\Jobs;

use App\Models\Document;
use App\Models\DocumentChunk;
use App\Services\DocumentParser;
use App\Services\TextChunker;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Laravel\Ai\Embeddings;
use Laravel\Ai\Enums\Lab;
use Log;
use Storage;

class ProcessDocument implements ShouldQueue
{
    use Queueable;

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
        $documentContent = $documentParser->extractText();

        $chunks = $textChunker->chunk($documentContent);

        foreach ($chunks as $index => $chunk) {
            $response = Embeddings::for([$chunk])->dimensions(1536)->generate(Lab::OpenAI, 'text-embedding-3-small');
            $this->document->chunks()->create([
                'content' => $chunk,
                'embedding' => $response->embeddings[0],
                'chunk_index' => $index,
            ]);
        }

        $this->document->update([
            'status' => Document::STATUS_READY,
        ]);
    }
}

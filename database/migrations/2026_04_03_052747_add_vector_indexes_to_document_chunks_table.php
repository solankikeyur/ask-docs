<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Adds:
     *  1. A standard B-tree index on `document_id` so the WHERE clause that
     *     pre-filters by document before the vector scan is fast.
     *  2. An HNSW index on the `embedding` vector column (cosine ops) so the
     *     vector similarity search is ANN (approximate nearest-neighbour) rather
     *     than a full sequential scan.
     *
     * HNSW parameters:
     *   m               = 16  — connections per layer; higher = better recall, more memory
     *   ef_construction = 64  — candidate set during build; higher = better quality, slower build
     *
     * These are safe defaults for most RAG workloads.  Tune `ef_search` at query
     * time (SET hnsw.ef_search = 100) if you need higher recall.
     */
    public function up(): void
    {
        Schema::table('document_chunks', function (Blueprint $table) {
            // B-tree index for the document_id pre-filter
            $table->index('document_id', 'document_chunks_document_id_idx');
        });

        // HNSW vector index — must be created with a raw statement because
        // Laravel's Schema builder does not expose pgvector-specific index types.
        DB::statement('
            CREATE INDEX IF NOT EXISTS document_chunks_embedding_hnsw_idx
            ON document_chunks
            USING hnsw (embedding vector_cosine_ops)
            WITH (m = 16, ef_construction = 64)
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS document_chunks_embedding_hnsw_idx');

        Schema::table('document_chunks', function (Blueprint $table) {
            $table->dropIndex('document_chunks_document_id_idx');
        });
    }
};

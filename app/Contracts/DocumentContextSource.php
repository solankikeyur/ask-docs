<?php

namespace App\Contracts;

use Illuminate\Support\Collection;

interface DocumentContextSource
{
    /**
     * Get the IDs of documents this source can use for context retrieval.
     *
     * @return array<int>
     */
    public function getAssignedDocumentIds(): array;

    /**
     * Get conversation history for context.
     *
     * @return Collection
     */
    public function messages(): Collection;
}
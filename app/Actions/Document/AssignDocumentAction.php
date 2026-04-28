<?php

namespace App\Actions\Document;

use App\Models\Document;

class AssignDocumentAction
{
    public function execute(Document $document, array $userIds): void
    {
        $document->users()->sync($userIds);
    }
}

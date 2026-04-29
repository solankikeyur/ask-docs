<?php

namespace App\Http\Resources\Chat;

use App\Http\Resources\Document\DocumentResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ChatResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title ?? 'Untitled Chat',
            'docId' => $this->document_id,
            'document' => new DocumentResource($this->document),
            'messages' => $this->messageRecords()->orderBy('id')->get()->map(fn($msg) => [
                'id' => $msg->id,
                'role' => $msg->role,
                'content' => $msg->content,
                'metadata' => $msg->metadata,
            ]),
        ];
    }
}

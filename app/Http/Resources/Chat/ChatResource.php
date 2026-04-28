<?php

namespace App\Http\Resources\Chat;

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
            'document' => [
                'id' => $this->document->id,
                'name' => $this->document->name,
            ],
            'messages' => $this->messageRecords()->orderBy('id')->get()->map(fn($msg) => [
                'id' => $msg->id,
                'role' => $msg->role,
                'content' => $msg->content,
                'metadata' => $msg->metadata,
            ]),
        ];
    }
}

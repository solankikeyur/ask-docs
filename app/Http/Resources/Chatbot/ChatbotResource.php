<?php

namespace App\Http\Resources\Chatbot;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ChatbotResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'settings' => $this->settings,
            'documents' => $this->documents->map(fn($doc) => [
                'id' => $doc->id,
                'name' => $doc->name,
            ]),
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}

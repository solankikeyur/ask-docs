<?php

namespace App\Services;

use App\Ai\Agents\AskDoc;
use App\Models\Chat;
use App\Models\DocumentChunk;
use Laravel\Ai\Embeddings;
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Messages\Message;

class AiChatService
{
    protected $chat;

    public function __construct(Chat $chat)
    {
        $this->chat = $chat;
    }

    public function answer($message)
    {
        $docContext = $this->getDocContext($message);
        $userMessage = "Question: $message, Context: $docContext";
        $response = (new AskDoc($this->chat))->prompt($userMessage, model: "gpt-4o-mini-2024-07-18", provider: Lab::OpenAI, timeout: 120);
        return (string) $response;
    }

    public function getDocContext($message)
    {
        $response = Embeddings::for([$message])->dimensions(1536)->generate(Lab::OpenAI, 'text-embedding-3-small');
        $document = DocumentChunk::where("document_id", $this->chat->document_id)
            ->whereVectorSimilarTo('embedding', $response->embeddings[0], 0.4)
            ->get();

        $context = $document->map(function ($chunk) {
            return $chunk->content;
        })->implode("\n");
        return $context;
    }

    public function getMessages()
    {
        return collect($this->chat->messages()
            ->latest('id')
            ->limit(50)
            ->get()
            ->reverse()
            ->map(function ($message) {
                return new Message($message->role, $message->content);
            })->all());
    }
}
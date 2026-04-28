<?php

namespace App\DTOs\Chatbot;

use App\Http\Requests\Chatbot\StoreChatbotRequest;

final readonly class CreateChatbotDTO
{
    public function __construct(
        public string $name,
        public ?string $description = null,
        public array $document_ids = [],
        public array $settings = [],
    ) {}

    public static function fromRequest(StoreChatbotRequest $request): self
    {
        return new self(
            $request->validated('name'),
            $request->validated('description'),
            $request->validated('document_ids', []),
            $request->validated('settings', []),
        );
    }
}

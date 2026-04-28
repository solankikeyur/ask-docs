<?php

namespace App\DTOs\Chat;

use App\Http\Requests\Chat\StoreChatRequest;

final readonly class CreateChatDTO
{
    public function __construct(
        public string $document_id,
        public string $content,
        public ?string $chat_id = null,
    ) {}

    public static function fromRequest(StoreChatRequest $request): self
    {
        return new self(
            $request->validated('document_id'),
            $request->validated('content'),
            $request->validated('chat_id'),
        );
    }
}

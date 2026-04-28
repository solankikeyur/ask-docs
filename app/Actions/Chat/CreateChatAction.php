<?php

namespace App\Actions\Chat;

use App\DTOs\Chat\CreateChatDTO;
use App\Models\Chat;
use App\Models\User;
use App\Repositories\Chat\ChatRepository;

class CreateChatAction
{
    public function __construct(
        protected ChatRepository $chatRepository
    ) {}

    public function execute(User $user, CreateChatDTO $dto): Chat
    {
        if ($dto->chat_id) {
            return $this->chatRepository->findForUser($user, $dto->chat_id);
        }

        return $this->chatRepository->create([
            'user_id' => $user->id,
            'document_id' => $dto->document_id,
            'title' => mb_substr($dto->content, 0, 80),
        ]);
    }
}

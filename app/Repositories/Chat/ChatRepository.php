<?php

namespace App\Repositories\Chat;

use App\Models\Chat;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class ChatRepository
{
    public function findForUser(User $user, string $chatId): ?Chat
    {
        return $user->chats()->findOrFail($chatId);
    }

    public function getHistoryForUser(User $user, ?string $activeChatId = null): array
    {
        return $user->chats()
            ->with('document:id,name')
            ->latest()
            ->get()
            ->map(fn($chat) => [
                'id' => $chat->id,
                'title' => $chat->title ?? 'Untitled Chat',
                'docId' => $chat->document_id,
                'document' => $chat->document,
                'active' => $chat->id === $activeChatId,
            ])
            ->toArray();
    }

    public function create(array $data): Chat
    {
        return Chat::create($data);
    }

    public function delete(Chat $chat): bool
    {
        return $chat->delete();
    }

    public function deleteAllForUser(User $user): bool
    {
        return $user->chats()->delete() > 0;
    }
}

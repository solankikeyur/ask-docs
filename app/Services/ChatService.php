<?php

namespace App\Services;

use App\Models\Chat;
use App\Models\User;
use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Collection;

class ChatService
{
    /**
     * Get chat history for a specific user, with optional active chat highlight.
     */
    public function getHistoryForUser(User $user, ?int $activeChatId = null): \Illuminate\Support\Collection
    {
        $query = Chat::query()->where('user_id', $user->id);

        return $query->latest()
            ->get()
            ->map(fn (Chat $chat) => [
                'id' => $chat->id,
                'title' => $chat->title,
                'docId' => $chat->document_id,
                'active' => $activeChatId !== null && $chat->id === $activeChatId,
            ]);
    }

    /**
     * Create a new chat session.
     */
    public function createChat(User $user, int $documentId, string $initialMessage): Chat
    {
        return Chat::create([
            'user_id' => $user->id,
            'document_id' => $documentId,
            'title' => str($initialMessage)->limit(50)->toString(),
        ]);
    }

    /**
     * Find a chat for a user or fail.
     */
    public function findForUser(User $user, int $chatId): Chat
    {
        return Chat::where('id', $chatId)
            ->where('user_id', $user->id)
            ->firstOrFail();
    }

    /**
     * Delete a chat.
     */
    public function delete(Chat $chat): bool
    {
        return $chat->delete();
    }

    /**
     * Delete all chats for a user.
     */
    public function deleteAllForUser(User $user): int
    {
        return Chat::where('user_id', $user->id)->delete();
    }
}

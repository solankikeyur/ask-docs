<?php

namespace App\Services;

use App\Models\Chatbot;
use App\Models\User;
use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Collection;

class ChatbotService
{
    /**
     * Get all chatbots based on user role.
     */
    public function getAllForUser(User $user): Collection
    {
        $query = Chatbot::query()->with(['documents' => fn ($q) => $q->select('documents.id', 'documents.name')]);

        if ($user->role !== UserRole::ADMIN) {
            $query->where('user_id', $user->id);
        }

        return $query->latest()->get();
    }

    /**
     * Store a new chatbot.
     */
    public function store(User $user, array $data): Chatbot
    {
        $chatbot = Chatbot::create([
            'user_id' => $user->id,
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'settings' => $data['settings'] ?? [],
        ]);

        if (!empty($data['document_ids'])) {
            $chatbot->documents()->attach($data['document_ids']);
        }

        return $chatbot;
    }

    /**
     * Update an existing chatbot.
     */
    public function update(Chatbot $chatbot, array $data): Chatbot
    {
        $chatbot->update([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'settings' => $data['settings'] ?? [],
        ]);

        $chatbot->documents()->sync($data['document_ids'] ?? []);

        return $chatbot;
    }

    /**
     * Delete a chatbot.
     */
    public function delete(Chatbot $chatbot): bool
    {
        return $chatbot->delete();
    }

    /**
     * Get unique conversation sessions for a chatbot.
     */
    public function getConversationsForChatbot(Chatbot $chatbot, int $perPage = 10)
    {
        return \App\Models\ChatbotMessage::where('chatbot_id', $chatbot->id)
            ->select('session_id')
            ->selectRaw('MAX(created_at) as last_message_at')
            ->selectRaw('COUNT(*) as message_count')
            ->selectRaw('(SELECT content FROM chatbot_messages as cm2 WHERE cm2.session_id = chatbot_messages.session_id AND cm2.role = \'user\' ORDER BY cm2.id DESC LIMIT 1) as latest_user_message')
            ->groupBy('session_id')
            ->orderBy('last_message_at', 'desc')
            ->paginate($perPage)
            ->withQueryString();
    }
}

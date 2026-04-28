<?php

namespace App\Repositories\Chatbot;

use App\Models\Chatbot;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class ChatbotRepository
{
    public function getAllForUser(User $user): Collection
    {
        if ($user->isAdmin()) {
            return Chatbot::latest()->get();
        }
        
        return $user->chatbots()->latest()->get();
    }

    public function create(array $data, array $documentIds = []): Chatbot
    {
        $chatbot = Chatbot::create($data);
        $chatbot->documents()->sync($documentIds);
        return $chatbot;
    }

    public function update(Chatbot $chatbot, array $data, array $documentIds = []): bool
    {
        $chatbot->update($data);
        $chatbot->documents()->sync($documentIds);
        return true;
    }

    public function delete(Chatbot $chatbot): bool
    {
        return $chatbot->delete();
    }

    public function getConversations(Chatbot $chatbot, int $perPage = 10)
    {
        $sessions = $chatbot->chatbotMessages()
            ->select('session_id', DB::raw('MAX(created_at) as last_message_at'))
            ->groupBy('session_id')
            ->orderBy('last_message_at', 'desc')
            ->paginate($perPage);

        $sessions->getCollection()->transform(function($msg) use ($chatbot) {
            $latest = $chatbot->chatbotMessages()
                ->where('session_id', $msg->session_id)
                ->where('role', 'user')
                ->latest()
                ->first();
                
            return [
                'session_id' => $msg->session_id,
                'last_message_at' => $msg->last_message_at,
                'message_count' => $chatbot->chatbotMessages()->where('session_id', $msg->session_id)->count(),
                'latest_user_message' => $latest?->content,
            ];
        });

        return $sessions;
    }
}

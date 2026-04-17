<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chatbot;
use App\Models\ChatbotMessage;
use App\Services\AiChatService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Laravel\Ai\Responses\StreamedAgentResponse;

class PublicChatController extends Controller
{
    /**
     * Handle public chatbot chat requests.
     */
    public function store(Request $request, string $publicId)
    {
        $chatbot = Chatbot::where('public_id', $publicId)->firstOrFail();

        $validated = $request->validate([
            'message' => 'required|string|max:10000',
            'session_id' => 'nullable|string',
        ]);

        $sessionId = $validated['session_id'] ?? (string) Str::uuid();

        // Scope the session history specifically to this user's conversation 
        $chatbot->current_session_id = $sessionId;

        // Save user message
        ChatbotMessage::create([
            'chatbot_id' => $chatbot->id,
            'session_id' => $sessionId,
            'role' => 'user',
            'content' => $validated['message'],
        ]);

        $aiChatService = new AiChatService($chatbot);

        $result = $aiChatService->streamAnswer($validated['message']);
        $stream = $result['stream'];
        $citations = $result['citations'];

        $stream->then(function (StreamedAgentResponse $response) use ($chatbot, $sessionId, $citations, $aiChatService) {
            ChatbotMessage::create([
                'chatbot_id' => $chatbot->id,
                'session_id' => $sessionId,
                'role' => 'assistant',
                'content' => $response->text,
                'metadata' => ['citations' => $aiChatService->filterUsedCitations($response->text, $citations)],
            ]);
        });

        return response()->stream(function () use ($stream, $citations) {
            // Send the metadata event
            echo "event: metadata\n";
            echo "data: " . json_encode(['citations' => $citations]) . "\n\n";

            foreach ($stream as $event) {
                if (is_string($event)) {
                    echo $event;
                } elseif (method_exists($event, 'toArray') && isset($event->toArray()['delta'])) {
                    echo $event->toArray()['delta'];
                }

                if (ob_get_level() > 0) {
                    ob_flush();
                }
                flush();
            }
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache, no-transform',
            'X-Accel-Buffering' => 'no',
            'Connection' => 'keep-alive',
            'X-Session-Id' => $sessionId,
        ]);
    }
}
<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use App\Models\Document;
use App\Services\AiChatService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Ai\Responses\StreamedAgentResponse;

class ChatController extends Controller
{
    /**
     * Display the chat page with history and assigned docs.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $documents = Document::select('id', 'name', 'status')
            ->latest()
            ->get();

        $chatHistory = Chat::with('document:id,name')
            ->where('user_id', $user->id)
            ->latest()
            ->get()
            ->map(fn (Chat $chat) => [
                'id' => $chat->id,
                'title' => $chat->title,
                'docId' => $chat->document_id,
                'active' => false,
            ]);

        return Inertia::render($this->getViewName($request), [
            'documents' => $documents,
            'chatHistory' => $chatHistory,
        ]);
    }

    /**
     * Show a specific chat.
     */
    public function show(Request $request, Chat $chat): Response
    {
        if ($chat->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized access to this chat.');
        }

        $documents = Document::select('id', 'name', 'status')
            ->latest()
            ->get();

        $chatHistory = Chat::where('user_id', $request->user()->id)
            ->latest()
            ->get()
            ->map(fn (Chat $c) => [
                'id' => $c->id,
                'title' => $c->title,
                'docId' => $c->document_id,
                'active' => $c->id === $chat->id,
            ]);

        return Inertia::render($this->getViewName($request), [
            'documents' => $documents,
            'chatHistory' => $chatHistory,
            'chat' => [
                'id' => $chat->id,
                'docId' => $chat->document_id,
                'document' => $chat->document()->select('id', 'name')->first(),
            ],
            'messages' => $chat->messages()->orderBy('id')->get(),
        ]);
    }

    /**
     * Store new chat or message with dynamic mock metadata.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'document_id' => 'required|exists:documents,id',
            'content' => 'required|string|max:10000',
            'chat_id' => 'nullable|exists:chats,id',
        ]);

        $chat = filled($validated['chat_id'] ?? null)
            ? Chat::where('id', $validated['chat_id'])
                ->where('user_id', $request->user()->id)
                ->firstOrFail()
            : Chat::create([
                'user_id' => $request->user()->id,
                'document_id' => $validated['document_id'],
                'title' => str($validated['content'])->limit(50)->toString(),
            ]);

        $chat->messages()->create([
            'role' => 'user', 
            'content' => $validated['content']
        ]);

        $aiChatService = new AiChatService($chat);

        $stream = $aiChatService->streamAnswer($validated['content'])
            ->then(function (StreamedAgentResponse $response) use ($chat) {
                $chat->messages()->create([
                    'role' => 'assistant',
                    'content' => $response->text,
                ]);
            });

        return response()->stream(function () use ($stream) {
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
            'X-Chat-Id' => $chat->id,
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache, no-transform',
            'X-Accel-Buffering' => 'no',
            'Connection' => 'keep-alive',
        ]);
    }

    /**
     * Determine the correct Inertia view based on the current route prefix.
     */
    protected function getViewName(Request $request): string
    {
        return $request->routeIs('admin.*') ? 'admin/chat' : 'chat';
    }

    /**
     * Determine the correct chat show route name based on the current route prefix.
     */
    protected function getShowRouteName(Request $request): string
    {
        return $request->routeIs('admin.*') ? 'admin.chat.show' : 'chat.show';
    }
}

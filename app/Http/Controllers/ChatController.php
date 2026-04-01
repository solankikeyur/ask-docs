<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\Chat;
use App\Models\Document;
use App\Models\Message;
use App\Services\AiChatService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChatController extends Controller
{
    /**
     * Display the chat page with history and assigned docs.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $documents = Document::select('id', 'name', 'status')->latest()->get();

        $chatHistory = Chat::where('user_id', $user->id)->with(['document:id,name'])->latest()->get()->map(fn($chat) => [
            'id' => $chat->id,
            'title' => $chat->title,
            'docId' => $chat->document_id,
            'active' => false,
        ]);

        $view = $request->routeIs('admin.*') ? 'admin/chat' : 'chat';

        return Inertia::render($view, [
            'documents' => $documents,
            'chatHistory' => $chatHistory,
        ]);
    }

    /**
     * Show a specific chat.
     */
    public function show(Request $request, Chat $chat)
    {

        $user = $request->user();
        if ($chat->user_id !== $user->id)
            abort(403);

        $documents = Document::select('id', 'name', 'status')->latest()->get();

        $chatHistory = Chat::where('user_id', $user->id)->latest()->get()->map(fn($c) => [
            'id' => $c->id,
            'title' => $c->title,
            'docId' => $c->document_id,
            'active' => $c->id === $chat->id,
        ]);

        $view = $request->routeIs('admin.*') ? 'admin/chat' : 'chat';

        return Inertia::render($view, [
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
            'content' => 'required|string',
            'chat_id' => 'nullable|exists:chats,id',
        ]);

        $user = $request->user();
        $chat = isset($validated['chat_id'])
            ? Chat::findOrFail($validated['chat_id'])
            : Chat::create([
                'user_id' => $user->id,
                'document_id' => $validated['document_id'],
                'title' => substr($validated['content'], 0, 50) . (strlen($validated['content']) > 50 ? '...' : ''),
            ]);

        $aiChatService = new AiChatService($chat);

        $aiAnswer = $aiChatService->answer($validated['content']);

        $chat->messages()->create(['role' => 'user', 'content' => $validated['content']]);

        $chat->messages()->create([
            'role' => 'assistant',
            'content' => $aiAnswer,
        ]);

        $routeName = $request->route()->getName() ?? '';
        $targetRoute = (str_starts_with($routeName, 'admin.') ? 'admin.' : '') . 'chat.show';

        return redirect()->route($targetRoute, $chat->id);
    }
}

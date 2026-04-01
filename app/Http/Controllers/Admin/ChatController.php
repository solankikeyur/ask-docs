<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
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
     * Display the admin chat page with history and docs.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('admin/chat', $this->getChatPageData($user->id));
    }

    /**
     * Show a specific chat.
     */
    public function show(Request $request, Chat $chat): Response
    {
        if ($chat->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized access to this chat.');
        }

        return Inertia::render('admin/chat', [
            ...$this->getChatPageData($request->user()->id, $chat->id),
            'chat' => [
                'id' => $chat->id,
                'docId' => $chat->document_id,
                'document' => $chat->document()->select('id', 'name')->first(),
            ],
            'messages' => $chat->messages()->orderBy('id')->get(),
        ]);
    }

    /**
     * Store new chat or message.
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
            'content' => $validated['content'],
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
     * Rename a chat.
     */
    public function update(Request $request, Chat $chat): RedirectResponse
    {
        if ($chat->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized access to this chat.');
        }

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
        ]);

        $chat->update([
            'title' => blank($validated['title'] ?? null) ? null : $validated['title'],
        ]);

        return redirect()->back(303);
    }

    /**
     * Delete a chat and its messages.
     */
    public function destroy(Request $request, Chat $chat): RedirectResponse
    {
        if ($chat->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized access to this chat.');
        }

        $chat->delete();

        return redirect()->route('admin.chat');
    }

    /**
     * Delete all chats (and their messages) for the current user.
     */
    public function destroyAll(Request $request): RedirectResponse
    {
        Chat::query()
            ->where('user_id', $request->user()->id)
            ->delete();

        return redirect()->route('admin.chat');
    }

    /**
     * Shared data for the chat page.
     *
     * @return array{documents: \Illuminate\Support\Collection<int, array{id:int,name:string,status:string}>, chatHistory: \Illuminate\Support\Collection<int, array{id:int,title:?string,docId:int,active:bool}>}
     */
    private function getChatPageData(int $userId, ?int $activeChatId = null): array
    {
        $documents = Document::query()
            ->select('id', 'name', 'status')
            ->latest()
            ->get();

        $chatHistory = Chat::query()
            ->where('user_id', $userId)
            ->latest()
            ->get()
            ->map(fn (Chat $chat) => [
                'id' => $chat->id,
                'title' => $chat->title,
                'docId' => $chat->document_id,
                'active' => $activeChatId !== null && $chat->id === $activeChatId,
            ]);

        return [
            'documents' => $documents,
            'chatHistory' => $chatHistory,
        ];
    }
}

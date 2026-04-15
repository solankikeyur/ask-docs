<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Chat;
use App\Models\User;
use App\Services\AiChatService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Ai\Responses\StreamedAgentResponse;

class ChatController extends Controller
{
    /**
     * Display the user chat page with history and assigned docs.
     */
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        return Inertia::render('user/chat', $this->getChatPageData($user));
    }

    /**
     * Show a specific chat.
     */
    public function show(Request $request, Chat $chat): Response
    {
        /** @var User $user */
        $user = $request->user();

        if ($chat->user_id !== $user->id) {
            abort(403, 'Unauthorized access to this chat.');
        }

        if (! $user->documents()->whereKey($chat->document_id)->exists()) {
            abort(403, 'You do not have access to this document.');
        }

        return Inertia::render('user/chat', [
            ...$this->getChatPageData($user, $chat->id),
            'chat' => [
                'id' => $chat->id,
                'docId' => $chat->document_id,
                'document' => $chat->document()->select('id', 'name')->first(),
            ],
            'messages' => $chat->messageRecords()->orderBy('id')->get(),
        ]);
    }

    /**
     * Store new chat or message (streaming).
     */
    public function store(Request $request)
    {
        /** @var User $user */
        $user = $request->user();

        $validated = $request->validate([
            'document_id' => [
                'required',
                Rule::exists('document_user', 'document_id')->where(fn ($q) => $q->where('user_id', $user->id)),
            ],
            'content' => 'required|string|max:10000',
            'chat_id' => 'nullable|integer',
        ]);

        $chat = filled($validated['chat_id'] ?? null)
            ? Chat::where('id', $validated['chat_id'])
                ->where('user_id', $user->id)
                ->firstOrFail()
            : Chat::create([
                'user_id' => $user->id,
                'document_id' => $validated['document_id'],
                'title' => str($validated['content'])->limit(50)->toString(),
            ]);

        if ((int) $validated['document_id'] !== (int) $chat->document_id) {
            abort(422, 'Document mismatch for this chat.');
        }

        $chat->messageRecords()->create([
            'role' => 'user',
            'content' => $validated['content'],
        ]);

        $aiChatService = new AiChatService($chat);

        $stream = $aiChatService->streamAnswer($validated['content'])
            ->then(function (StreamedAgentResponse $response) use ($chat) {
                $chat->messageRecords()->create([
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
        /** @var User $user */
        $user = $request->user();

        if ($chat->user_id !== $user->id) {
            abort(403, 'Unauthorized access to this chat.');
        }

        if (! $user->documents()->whereKey($chat->document_id)->exists()) {
            abort(403, 'You do not have access to this document.');
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
        /** @var User $user */
        $user = $request->user();

        if ($chat->user_id !== $user->id) {
            abort(403, 'Unauthorized access to this chat.');
        }

        if (! $user->documents()->whereKey($chat->document_id)->exists()) {
            abort(403, 'You do not have access to this document.');
        }

        $chat->delete();

        return redirect()->route('user.chat');
    }

    /**
     * Delete all chats (and their messages) for the current user.
     */
    public function destroyAll(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        Chat::query()
            ->where('user_id', $user->id)
            ->delete();

        return redirect()->route('user.chat');
    }

    /**
     * Shared data for the chat page.
     *
     * @return array{documents: \Illuminate\Support\Collection<int, array{id:int,name:string,status:string}>, chatHistory: \Illuminate\Support\Collection<int, array{id:int,title:?string,docId:int,active:bool}>}
     */
    private function getChatPageData(User $user, ?int $activeChatId = null): array
    {
        $documents = $user->documents()
            ->select('documents.id', 'documents.name', 'documents.status')
            ->latest('documents.id')
            ->get();

        $documentIds = $documents->pluck('id');

        $chatHistory = Chat::query()
            ->where('user_id', $user->id)
            ->when(
                $documentIds->isNotEmpty(),
                fn ($query) => $query->whereIn('document_id', $documentIds),
                fn ($query) => $query->whereRaw('1=0'),
            )
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

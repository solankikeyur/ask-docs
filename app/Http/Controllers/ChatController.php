<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use App\Models\Document;
use App\Services\ChatService;
use App\Services\AiChatService;
use App\Services\DocumentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Ai\Responses\StreamedAgentResponse;

class ChatController extends Controller
{
    public function __construct(
        protected ChatService $chatService,
        protected DocumentService $documentService
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        
        $documents = $this->documentService->getPaginatedForUser($user, null, 100)
            ->through(fn($doc) => [
                'id' => $doc->id,
                'name' => $doc->name,
                'status' => $doc->status,
            ])
            ->items();

        return Inertia::render('chat/index', [
            'documents' => $documents,
            'chatHistory' => $this->chatService->getHistoryForUser($user),
        ]);
    }

    public function show(Request $request, Chat $chat): Response
    {
        if (auth()->user()->role !== \App\Enums\UserRole::ADMIN && $chat->user_id !== auth()->id()) {
            abort(403);
        }

        $user = $request->user();

        $documents = $this->documentService->getPaginatedForUser($user, null, 100)
            ->through(fn($doc) => [
                'id' => $doc->id,
                'name' => $doc->name,
                'status' => $doc->status,
            ])
            ->items();

        return Inertia::render('chat/index', [
            'documents' => $documents,
            'chatHistory' => $this->chatService->getHistoryForUser($user, $chat->id),
            'chat' => [
                'id' => $chat->id,
                'docId' => $chat->document_id,
                'document' => $chat->document()->select('id', 'name')->first(),
            ],
            'messages' => $chat->messageRecords()->orderBy('id')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'document_id' => 'required|exists:documents,id',
            'content' => 'required|string|max:10000',
            'chat_id' => 'nullable|integer',
        ]);

        // Authorization check for document: Admin sees all, others only their own
        $document = Document::findOrFail($validated['document_id']);
        if ($user->role !== \App\Enums\UserRole::ADMIN && $document->user_id !== $user->id) {
            abort(403, 'You do not have access to this document.');
        }

        if ($document->status !== Document::STATUS_READY) {
            return response()->json([
                'error' => 'Document is not ready for chat.',
            ], 422);
        }

        $chat = filled($validated['chat_id'] ?? null)
            ? $this->chatService->findForUser($user, $validated['chat_id'])
            : $this->chatService->createChat($user, $validated['document_id'], $validated['content']);

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

    public function update(Request $request, Chat $chat): RedirectResponse
    {
        if (auth()->user()->role !== \App\Enums\UserRole::ADMIN && $chat->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
        ]);

        $chat->update([
            'title' => blank($validated['title'] ?? null) ? null : $validated['title'],
        ]);

        return redirect()->back(303);
    }

    public function destroy(Chat $chat): RedirectResponse
    {
        if (auth()->user()->role !== \App\Enums\UserRole::ADMIN && $chat->user_id !== auth()->id()) {
            abort(403);
        }

        $this->chatService->delete($chat);

        return redirect()->route('chat.index');
    }

    public function destroyAll(Request $request): RedirectResponse
    {
        $this->chatService->deleteAllForUser($request->user());

        return redirect()->route('chat.index');
    }
}

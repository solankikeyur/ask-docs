<?php

namespace App\Http\Controllers;

use App\Actions\Chat\CreateChatAction;
use App\DTOs\Chat\CreateChatDTO;
use App\Http\Requests\Chat\StoreChatRequest;
use App\Http\Resources\Chat\ChatResource;
use App\Http\Resources\Document\DocumentResource;
use App\Models\Chat;
use App\Models\Document;
use App\Repositories\Chat\ChatRepository;
use App\Repositories\Document\DocumentRepository;
use App\Services\AiChatService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Ai\Responses\StreamedAgentResponse;

class ChatController extends Controller
{
    public function __construct(
        protected ChatRepository $chatRepository,
        protected DocumentRepository $documentRepository,
        protected CreateChatAction $createChatAction
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        
        $documents = $this->documentRepository->getPaginatedForUser($user, null, 100);

        return Inertia::render('chat/index', [
            'documents' => DocumentResource::collection($documents),
            'chatHistory' => $this->chatRepository->getHistoryForUser($user),
        ]);
    }

    public function show(Request $request, Chat $chat): Response
    {
        $this->authorize('view', $chat);

        $user = $request->user();

        $documents = $this->documentRepository->getPaginatedForUser($user, null, 100);

        return Inertia::render('chat/index', [
            'documents' => DocumentResource::collection($documents),
            'chatHistory' => $this->chatRepository->getHistoryForUser($user, $chat->id),
            'chat' => new ChatResource($chat),
        ]);
    }

    public function store(StoreChatRequest $request)
    {
        $user = $request->user();
        $dto = CreateChatDTO::fromRequest($request);

        $document = $this->documentRepository->findOrFail($dto->document_id);
        $this->authorize('view', $document);

        if ($document->status !== Document::STATUS_READY) {
            return response()->json([
                'error' => 'Document is not ready for chat.',
            ], 422);
        }

        $chat = $this->createChatAction->execute($user, $dto);

        $chat->messageRecords()->create([
            'role' => 'user',
            'content' => $dto->content,
        ]);

        $aiChatService = new AiChatService($chat);

        $result = $aiChatService->streamAnswer($dto->content);
        $stream = $result['stream'];
        $citations = $result['citations'];

        $stream->then(function (StreamedAgentResponse $response) use ($chat, $citations, $aiChatService) {
            $chat->messageRecords()->create([
                'role' => 'assistant',
                'content' => $response->text,
                'metadata' => ['citations' => $aiChatService->filterUsedCitations($response->text, $citations)],
            ]);
        });

        return response()->stream(function () use ($stream, $citations) {
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
            'X-Chat-Id' => $chat->id,
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache, no-transform',
            'X-Accel-Buffering' => 'no',
            'Connection' => 'keep-alive',
        ]);
    }

    public function update(Request $request, Chat $chat): RedirectResponse
    {
        $this->authorize('update', $chat);

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
        $this->authorize('delete', $chat);

        $this->chatRepository->delete($chat);

        return redirect()->route('chat.index');
    }

    public function destroyAll(Request $request): RedirectResponse
    {
        $this->chatRepository->deleteAllForUser($request->user());

        return redirect()->route('chat.index');
    }
}

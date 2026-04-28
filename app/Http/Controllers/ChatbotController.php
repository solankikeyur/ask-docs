<?php

namespace App\Http\Controllers;

use App\DTOs\Chatbot\CreateChatbotDTO;
use App\Http\Requests\Chatbot\StoreChatbotRequest;
use App\Http\Resources\Chatbot\ChatbotResource;
use App\Http\Resources\Document\DocumentResource;
use App\Models\Chatbot;
use App\Models\ChatbotMessage;
use App\Repositories\Chatbot\ChatbotRepository;
use App\Repositories\Document\DocumentRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChatbotController extends Controller
{
    public function __construct(
        protected ChatbotRepository $chatbotRepository,
        protected DocumentRepository $documentRepository
    ) {}

    public function index(Request $request): Response
    {
        $chatbots = $this->chatbotRepository->getAllForUser($request->user());

        return Inertia::render('chatbots/index', [
            'chatbots' => ChatbotResource::collection($chatbots),
        ]);
    }

    public function create(Request $request): Response
    {
        $documents = $this->documentRepository->getPaginatedForUser($request->user(), null, 100);

        return Inertia::render('chatbots/create', [
            'documents' => DocumentResource::collection($documents->items()),
        ]);
    }

    public function store(StoreChatbotRequest $request): RedirectResponse
    {
        $dto = CreateChatbotDTO::fromRequest($request);

        $this->chatbotRepository->create([
            'user_id' => $request->user()->id,
            'name' => $dto->name,
            'description' => $dto->description,
            'settings' => $dto->settings,
        ], $dto->document_ids);

        return redirect()->route('chatbots.index')->with('success', 'Chatbot created successfully.');
    }

    public function show(Chatbot $chatbot): Response
    {
        $this->authorize('view', $chatbot);

        $chatbot->load('documents');

        return Inertia::render('chatbots/show', [
            'chatbot' => new ChatbotResource($chatbot),
            'conversations' => $this->chatbotRepository->getConversations($chatbot),
        ]);
    }

    public function getTranscript(Chatbot $chatbot, string $sessionId): JsonResponse
    {
        $this->authorize('view', $chatbot);

        $messages = ChatbotMessage::where('chatbot_id', $chatbot->id)
            ->where('session_id', $sessionId)
            ->orderBy('created_at', 'asc')
            ->limit(500)
            ->get();

        return response()->json([
            'messages' => $messages,
        ]);
    }

    public function edit(Chatbot $chatbot): Response
    {
        $this->authorize('update', $chatbot);

        $chatbot->load('documents');

        $documents = $this->documentRepository->getPaginatedForUser(auth()->user(), null, 100);

        return Inertia::render('chatbots/edit', [
            'chatbot' => new ChatbotResource($chatbot),
            'documents' => DocumentResource::collection($documents->items()),
        ]);
    }

    public function update(StoreChatbotRequest $request, Chatbot $chatbot): RedirectResponse
    {
        $this->authorize('update', $chatbot);

        $dto = CreateChatbotDTO::fromRequest($request);

        $this->chatbotRepository->update($chatbot, [
            'name' => $dto->name,
            'description' => $dto->description,
            'settings' => $dto->settings,
        ], $dto->document_ids);

        return redirect()->route('chatbots.index')->with('success', 'Chatbot updated successfully.');
    }

    public function destroy(Chatbot $chatbot): RedirectResponse
    {
        $this->authorize('delete', $chatbot);

        $this->chatbotRepository->delete($chatbot);

        return redirect()->route('chatbots.index')->with('success', 'Chatbot deleted successfully.');
    }
}

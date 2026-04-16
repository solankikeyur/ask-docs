<?php

namespace App\Http\Controllers;

use App\Models\Chatbot;
use App\Models\Document;
use App\Services\ChatbotService;
use App\Services\DocumentService;
use App\Http\Requests\ChatbotRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChatbotController extends Controller
{
    public function __construct(
        protected ChatbotService $chatbotService,
        protected DocumentService $documentService
    ) {}

    public function index(Request $request): Response
    {
        $chatbots = $this->chatbotService->getAllForUser($request->user());

        return Inertia::render('chatbots/index', [
            'chatbots' => $chatbots,
        ]);
    }

    public function create(Request $request): Response
    {
        // Users can only attach documents they own/have access to.
        $documents = $this->documentService->getPaginatedForUser($request->user(), null, 100)
            ->through(fn($doc) => ['id' => $doc->id, 'name' => $doc->name])
            ->items();

        return Inertia::render('chatbots/create', [
            'documents' => $documents,
        ]);
    }

    public function store(ChatbotRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $this->chatbotService->store($request->user(), $validated);

        return redirect()->route('chatbots.index')->with('success', 'Chatbot created successfully.');
    }

    public function show(Chatbot $chatbot): Response
    {
        $this->authorize('view', $chatbot);

        $chatbot->load(['documents' => fn ($q) => $q->select('documents.id', 'documents.name')]);

        $conversations = $this->chatbotService->getConversationsForChatbot($chatbot);

        return Inertia::render('chatbots/show', [
            'chatbot' => $chatbot,
            'conversations' => $conversations,
        ]);
    }

    public function getTranscript(Chatbot $chatbot, string $sessionId): \Illuminate\Http\JsonResponse
    {
        $this->authorize('view', $chatbot);

        $messages = \App\Models\ChatbotMessage::where('chatbot_id', $chatbot->id)
            ->where('session_id', $sessionId)
            ->orderBy('id', 'asc')
            ->limit(500) // Safety limit
            ->get();

        return response()->json([
            'messages' => $messages,
        ]);
    }

    public function edit(Chatbot $chatbot): Response
    {
        $this->authorize('update', $chatbot);

        $chatbot->load(['documents' => fn ($q) => $q->select('documents.id', 'documents.name')]);

        $documents = $this->documentService->getPaginatedForUser(auth()->user(), null, 100)
            ->through(fn($doc) => ['id' => $doc->id, 'name' => $doc->name])
            ->items();

        return Inertia::render('chatbots/edit', [
            'chatbot' => $chatbot,
            'documents' => $documents,
        ]);
    }

    public function update(ChatbotRequest $request, Chatbot $chatbot): RedirectResponse
    {
        $this->authorize('update', $chatbot);

        $validated = $request->validated();

        $this->chatbotService->update($chatbot, $validated);

        return redirect()->route('chatbots.index')->with('success', 'Chatbot updated successfully.');
    }

    public function destroy(Chatbot $chatbot): RedirectResponse
    {
        $this->authorize('delete', $chatbot);

        $this->chatbotService->delete($chatbot);

        return redirect()->route('chatbots.index')->with('success', 'Chatbot deleted successfully.');
    }
}

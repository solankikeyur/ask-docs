<?php

namespace App\Http\Controllers;

use App\Models\Chatbot;
use App\Models\Document;
use App\Services\ChatbotService;
use App\Services\DocumentService;
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

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'document_ids' => 'array',
            'document_ids.*' => 'integer|exists:documents,id',
            'settings' => 'nullable|array',
            'settings.primary_color' => 'nullable|string|max:20',
            'settings.welcome_title' => 'nullable|string|max:255',
            'settings.welcome_subtitle' => 'nullable|string|max:255',
            'settings.header_logo' => 'nullable|string',
        ]);

        $this->chatbotService->store($request->user(), $validated);

        return redirect()->route('chatbots.index')->with('success', 'Chatbot created successfully.');
    }

    public function show(Chatbot $chatbot): Response
    {
        if (auth()->user()->role !== \App\Enums\UserRole::ADMIN && $chatbot->user_id !== auth()->id()) {
            abort(403);
        }

        $chatbot->load(['documents' => fn ($q) => $q->select('documents.id', 'documents.name')]);

        $conversations = $this->chatbotService->getConversationsForChatbot($chatbot);

        return Inertia::render('chatbots/show', [
            'chatbot' => $chatbot,
            'conversations' => $conversations,
        ]);
    }

    public function getTranscript(Chatbot $chatbot, string $sessionId): \Illuminate\Http\JsonResponse
    {
        if (auth()->user()->role !== \App\Enums\UserRole::ADMIN && $chatbot->user_id !== auth()->id()) {
            abort(403);
        }

        $messages = \App\Models\ChatbotMessage::where('chatbot_id', $chatbot->id)
            ->where('session_id', $sessionId)
            ->orderBy('id', 'asc')
            ->get();

        return response()->json([
            'messages' => $messages,
        ]);
    }

    public function edit(Chatbot $chatbot): Response
    {
        if (auth()->user()->role !== \App\Enums\UserRole::ADMIN && $chatbot->user_id !== auth()->id()) {
            abort(403);
        }

        $chatbot->load(['documents' => fn ($q) => $q->select('documents.id', 'documents.name')]);

        $documents = $this->documentService->getPaginatedForUser(auth()->user(), null, 100)
            ->through(fn($doc) => ['id' => $doc->id, 'name' => $doc->name])
            ->items();

        return Inertia::render('chatbots/edit', [
            'chatbot' => $chatbot,
            'documents' => $documents,
        ]);
    }

    public function update(Request $request, Chatbot $chatbot): RedirectResponse
    {
        if (auth()->user()->role !== \App\Enums\UserRole::ADMIN && $chatbot->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'document_ids' => 'array',
            'document_ids.*' => 'integer|exists:documents,id',
            'settings' => 'nullable|array',
            'settings.primary_color' => 'nullable|string|max:20',
            'settings.welcome_title' => 'nullable|string|max:255',
            'settings.welcome_subtitle' => 'nullable|string|max:255',
            'settings.header_logo' => 'nullable|string',
        ]);

        $this->chatbotService->update($chatbot, $validated);

        return redirect()->route('chatbots.index')->with('success', 'Chatbot updated successfully.');
    }

    public function destroy(Chatbot $chatbot): RedirectResponse
    {
        if (auth()->user()->role !== \App\Enums\UserRole::ADMIN && $chatbot->user_id !== auth()->id()) {
            abort(403);
        }

        $this->chatbotService->delete($chatbot);

        return redirect()->route('chatbots.index')->with('success', 'Chatbot deleted successfully.');
    }
}

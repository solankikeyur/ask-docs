<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Chatbot;
use App\Models\Document;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ChatbotController extends Controller
{
    /**
     * Display a listing of the chatbots.
     */
    public function index(Request $request): Response
    {
        $chatbots = Chatbot::query()
            ->with(['documents' => fn ($q) => $q->select('documents.id', 'documents.name')])
            ->latest()
            ->get();

        return Inertia::render('admin/chatbots/index', [
            'chatbots' => $chatbots,
        ]);
    }

    /**
     * Show the form for creating a new chatbot.
     */
    public function create(Request $request): Response
    {
        $documents = Document::query()
            ->select('documents.id', 'documents.name')
            ->latest()
            ->get();

        return Inertia::render('admin/chatbots/create', [
            'documents' => $documents,
        ]);
    }

    /**
     * Store a newly created chatbot.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'document_ids' => 'array',
            'document_ids.*' => 'integer|exists:documents,id',
        ]);

        $chatbot = Chatbot::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
        ]);

        if (!empty($validated['document_ids'])) {
            $chatbot->documents()->attach($validated['document_ids']);
        }

        return redirect()->route('admin.chatbots.index');
    }

    /**
     * Display the specified chatbot.
     */
    public function show(Request $request, Chatbot $chatbot): Response
    {
        $chatbot->load(['documents' => fn ($q) => $q->select('documents.id', 'documents.name')]);

        return Inertia::render('admin/chatbots/show', [
            'chatbot' => $chatbot,
        ]);
    }

    /**
     * Show the form for editing the specified chatbot.
     */
    public function edit(Request $request, Chatbot $chatbot): Response
    {
        $chatbot->load(['documents' => fn ($q) => $q->select('documents.id', 'documents.name')]);

        $documents = Document::query()
            ->select('documents.id', 'documents.name')
            ->latest()
            ->get();

        return Inertia::render('admin/chatbots/edit', [
            'chatbot' => $chatbot,
            'documents' => $documents,
        ]);
    }

    /**
     * Update the specified chatbot.
     */
    public function update(Request $request, Chatbot $chatbot): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'document_ids' => 'array',
            'document_ids.*' => 'integer|exists:documents,id',
        ]);

        $chatbot->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
        ]);

        $chatbot->documents()->sync($validated['document_ids'] ?? []);

        return redirect()->route('admin.chatbots.index');
    }

    /**
     * Remove the specified chatbot.
     */
    public function destroy(Request $request, Chatbot $chatbot): RedirectResponse
    {
        $chatbot->delete();

        return redirect()->route('admin.chatbots.index');
    }
}
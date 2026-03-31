<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\Chat;
use App\Models\Document;
use App\Models\Message;
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
            'messages' => $chat->messages()->orderBy('created_at')->get(),
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

        // Save User Message
        $chat->messages()->create(['role' => 'user', 'content' => $validated['content']]);

        // Generate Dynamic Mock Assistant Response
        $docName = Document::find($validated['document_id'])->name;
        $cleanDocName = explode('_', $docName)[0] . '.pdf';

        $metadata = [
            'citations' => [
                ['doc' => $cleanDocName, 'page' => 'p.' . rand(1, 50)],
                ['doc' => $cleanDocName, 'page' => 'p.' . rand(51, 100)],
            ]
        ];

        // Randomly add a table or risks to demonstrate dynamicity
        if (str_contains(strtolower($validated['content']), 'revenue') || str_contains(strtolower($validated['content']), 'finance')) {
            $metadata['tableData'] = [
                ['region' => 'North America', 'value' => '$' . rand(100, 200) . 'M', 'change' => '+' . rand(1, 15) . '%', 'confidence' => 'ready'],
                ['region' => 'EMEA', 'value' => '$' . rand(50, 150) . 'M', 'change' => rand(0, 1) ? '+' . rand(1, 5) . '%' : '-' . rand(1, 5) . '%', 'confidence' => 'processing'],
            ];
        }

        if (str_contains(strtolower($validated['content']), 'risk') || str_contains(strtolower($validated['content']), 'issue')) {
            $metadata['risks'] = [
                ['icon' => 'alert', 'text' => "Identified potential compliance gap in section " . rand(2, 5)],
                ['icon' => 'warn', 'text' => "Market volatility mentioned as primary external risk factor."],
            ];
        }

        $chat->messages()->create([
            'role' => 'assistant',
            'content' => "Based on the analysis of **{$cleanDocName}**, I've compiled the relevant data. " .
                (isset($metadata['tableData']) ? "The financial projections are visualized below." : "The core findings address your query directly."),
            'metadata' => $metadata,
        ]);

        $routeName = $request->route()->getName() ?? '';
        $targetRoute = (str_starts_with($routeName, 'admin.') ? 'admin.' : '') . 'chat.show';
        
        return redirect()->route($targetRoute, $chat->id);
    }
}

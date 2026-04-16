<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\User;
use App\Services\DocumentService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class DocumentController extends Controller
{
    public function __construct(
        protected DocumentService $documentService
    ) {}

    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $documents = $this->documentService->getPaginatedForUser($request->user(), $search)
            ->through(function ($doc) {
                return [
                    'id' => $doc->id,
                    'name' => $doc->name,
                    'size' => $doc->size,
                    'type' => $doc->type,
                    'status' => $doc->status,
                    'download_url' => route('documents.download', $doc->id),
                    'assignedTo' => $doc->users->pluck('name')->toArray(),
                    'assignedUserIds' => $doc->users->pluck('id')->toArray(),
                    'updated' => $doc->updated_at->diffForHumans(),
                ];
            });

        $allUsers = User::select('id', 'name')->get();

        return Inertia::render('documents/index', [
            'documents' => $documents,
            'allUsers' => $allUsers,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'document' => 'required|file|mimes:pdf|max:50240',
        ]);

        try {
            $this->documentService->store($request->file('document'), $request->user());
            return redirect()->back()->with('success', 'Document uploaded successfully and is being processed.');
        } catch (\Exception $e) {
            return back()->withErrors(['document' => $e->getMessage()]);
        }
    }

    public function assign(Request $request, Document $document): RedirectResponse
    {
        $request->validate([
            'userIds' => 'array',
            'userIds.*' => 'exists:users,id',
        ]);

        $this->documentService->assignUsers($document, $request->input('userIds', []));

        return redirect()->back()->with('success', 'Document users updated successfully.');
    }

    public function destroy(Document $document): RedirectResponse
    {
        // Authorization check if not admin
        if (auth()->user()->role !== \App\Enums\UserRole::ADMIN && $document->user_id !== auth()->id()) {
            abort(403);
        }

        $this->documentService->delete($document);

        return redirect()->back()->with('success', 'Document deleted successfully.');
    }

    public function download(Document $document)
    {
        \Illuminate\Support\Facades\Log::info('Download requested for document: ' . $document->id);

        // Authorization check: Admin sees all, others only their own uploads
        if (auth()->user()->role !== \App\Enums\UserRole::ADMIN && $document->user_id !== auth()->id()) {
            abort(403);
        }

        $disk = Document::storageDisk();
        if (!Storage::disk($disk)->exists($document->path)) {
            return back()->withErrors(['download' => 'File not found on storage disk: ' . $document->path]);
        }

        $absolutePath = Storage::disk($disk)->path($document->path);
        
        return response()->download($absolutePath, $document->name);
    }
}

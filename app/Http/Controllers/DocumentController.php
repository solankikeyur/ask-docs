<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\User;
use App\Services\DocumentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class DocumentController extends Controller
{
    public function __construct(
        protected DocumentService $documentService
    ) {
    }

    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $documents = $this->documentService->getPaginatedForUser($request->user(), $search, 10, ['users'])
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
            'document' => 'required|file|mimes:pdf,docx,doc|max:15360',
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
        $this->authorize('delete', $document);

        $this->documentService->delete($document);

        return redirect()->back()->with('success', 'Document deleted successfully.');
    }

    public function download(Document $document)
    {
        $this->authorize('download', $document);

        $disk = Document::storageDisk();

        if (!Storage::disk($disk)->exists($document->path)) {
            return back()->withErrors(['download' => 'File not found on storage disk: ' . $document->path]);
        }
        // Redirect to a direct URL. For S3, use a temporary signed URL.
        if ($disk === 's3') {
            return redirect()->away(
                Storage::disk($disk)->temporaryUrl($document->path, now()->addMinutes(15))
            );
        }
        // For local storage, redirect to the public URL
        return redirect()->away(Storage::disk($disk)->url($document->path));
    }
}

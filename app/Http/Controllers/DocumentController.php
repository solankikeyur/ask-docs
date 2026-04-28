<?php

namespace App\Http\Controllers;

use App\Actions\Document\AssignDocumentAction;
use App\Actions\Document\StoreDocumentAction;
use App\DTOs\Document\UploadDocumentDTO;
use App\Http\Requests\Document\StoreDocumentRequest;
use App\Http\Resources\Document\DocumentResource;
use App\Http\Resources\User\UserResource;
use App\Models\Document;
use App\Models\User;
use App\Repositories\Document\DocumentRepository;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class DocumentController extends Controller
{
    public function __construct(
        protected DocumentRepository $documentRepository,
        protected StoreDocumentAction $storeDocumentAction,
        protected AssignDocumentAction $assignDocumentAction
    ) {}

    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $documents = $this->documentRepository->getPaginatedForUser($request->user(), $search, 10);

        return Inertia::render('documents/index', [
            'documents' => DocumentResource::collection($documents),
            'allUsers' => UserResource::collection(User::select('id', 'name')->get()),
        ]);
    }

    public function store(StoreDocumentRequest $request): RedirectResponse
    {
        try {
            $dto = UploadDocumentDTO::fromRequest($request);
            $this->storeDocumentAction->execute($dto, $request->user());
            
            return redirect()->back()->with('success', 'Document uploaded successfully and is being processed.');
        } catch (\Exception $e) {
            return back()->withErrors(['document' => $e->getMessage()]);
        }
    }

    public function assign(Request $request, Document $document): RedirectResponse
    {
        $validated = $request->validate([
            'userIds' => 'array',
            'userIds.*' => 'exists:users,id',
        ]);

        $this->assignDocumentAction->execute($document, $validated['userIds'] ?? []);

        return redirect()->back()->with('success', 'Document users updated successfully.');
    }

    public function destroy(Document $document): RedirectResponse
    {
        $this->authorize('delete', $document);

        // Delete from storage
        Storage::disk(Document::storageDisk())->delete($document->path);
        
        $document->delete();

        return redirect()->back()->with('success', 'Document deleted successfully.');
    }

    public function download(Document $document)
    {
        $this->authorize('download', $document);

        $disk = Document::storageDisk();

        if (!Storage::disk($disk)->exists($document->path)) {
            return back()->withErrors(['download' => 'File not found on storage disk: ' . $document->path]);
        }

        if ($disk === 's3') {
            return redirect()->away(
                Storage::disk($disk)->temporaryUrl($document->path, now()->addMinutes(15))
            );
        }

        return redirect()->away(Storage::disk($disk)->url($document->path));
    }
}

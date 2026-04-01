<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Document;
use App\Models\User;
use App\Jobs\ProcessDocument;
use App\Support\FileSize;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DocumentController extends Controller
{
    public function index(Request $request)
    {
        $query = $request->input('search');

        $documents = Document::query()
            ->with('users')
            ->when($query, function ($q) use ($query) {
                $q->where('name', 'like', '%' . $query . '%');
            })
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(function ($doc) {
                return [
                    'id' => $doc->id,
                    'name' => $doc->name,
                    'size' => $doc->size,
                    'type' => $doc->type,
                    'status' => $doc->status,
                    'assignedTo' => $doc->users->pluck('name')->toArray(),
                    'assignedUserIds' => $doc->users->pluck('id')->toArray(),
                    'updated' => $doc->updated_at->diffForHumans(),
                ];
            });

        $allUsers = User::select('id', 'name')->get();

        return Inertia::render('admin/documents', [
            'documents' => $documents,
            'allUsers' => $allUsers,
        ]);
    }

    public function assign(Request $request, Document $document)
    {
        $request->validate([
            'userIds' => 'array',
            'userIds.*' => 'exists:users,id',
        ]);

        $document->users()->sync($request->input('userIds', []));

        return redirect()->back()->with('success', 'Document users updated successfully.');
    }

    public function destroy(Document $document)
    {
        // Delete from storage
        if (Storage::disk('public')->exists($document->path)) {
            Storage::disk('public')->delete($document->path);
        }

        // Delete from database
        $document->delete();

        return redirect()->back()->with('success', 'Document deleted successfully.');
    }

    public function store(Request $request)
    {
        $request->validate([
            'document' => 'required|file|mimes:pdf|max:10240',
        ]);

        $file = $request->file('document');
        $path = $file->store('documents', 'public');

        $document = Document::create([
            'name' => $file->getClientOriginalName(),
            'path' => $path,
            'size' => FileSize::human((int) $file->getSize()),
            'type' => strtoupper($file->getClientOriginalExtension()),
            'status' => Document::STATUS_PROCESSING,
        ]);

        ProcessDocument::dispatch($document);

        return redirect()->back()->with('success', 'Document uploaded successfully and is being processed.');
    }
}

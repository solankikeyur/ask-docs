<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Document;
use App\Jobs\ProcessDocument;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DocumentController extends Controller
{
    public function index(Request $request)
    {
        $query = $request->input('search');

        $documents = Document::query()
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
                    'assignedTo' => [], // TODO: Implement user assignment
                    'updated' => $doc->updated_at->diffForHumans(),
                ];
            });

        return Inertia::render('admin/documents', [
            'documents' => $documents,
        ]);
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
            'document' => 'required|file|mimes:pdf,docx,csv,txt|max:10240',
        ]);

        $file = $request->file('document');
        $path = $file->store('documents', 'public');

        $document = Document::create([
            'name' => $file->getClientOriginalName(),
            'path' => $path,
            'size' => $this->formatBytes($file->getSize()),
            'type' => strtoupper($file->getClientOriginalExtension()),
            'status' => Document::STATUS_PROCESSING,
        ]);

        ProcessDocument::dispatch($document);

        return redirect()->back()->with('success', 'Document uploaded successfully and is being processed.');
    }

    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);

        $bytes /= pow(1024, $pow);

        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}

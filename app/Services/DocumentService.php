<?php

namespace App\Services;

use App\Models\Document;
use App\Models\User;
use App\Enums\UserRole;
use App\Jobs\ProcessDocument;
use App\Support\FileSize;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class DocumentService
{
    /**
     * Get paginated documents based on user role and search query.
     */
    public function getPaginatedForUser(User $user, ?string $search = null, int $perPage = 10): LengthAwarePaginator
    {
        $query = Document::query();

        // Scoping: Admin sees all, others see only their own.
        if ($user->role !== UserRole::ADMIN) {
            $query->where('user_id', $user->id);
        }

        return $query
            ->when($search, function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%');
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * Store and process a new document.
     */
    public function store(UploadedFile $file, User $user): Document
    {
        $path = $file->store(Document::STORAGE_FOLDER, Document::storageDisk());

        if ($path === false) {
            throw new \Exception('Failed to upload the file to storage.');
        }

        $document = Document::create([
            'user_id' => $user->id,
            'name' => $file->getClientOriginalName(),
            'path' => $path,
            'size' => FileSize::human((int) $file->getSize()),
            'type' => strtoupper($file->getClientOriginalExtension()),
            'status' => Document::STATUS_PROCESSING,
        ]);

        ProcessDocument::dispatch($document);

        return $document;
    }

    /**
     * Delete a document and its stored file.
     */
    public function delete(Document $document): bool
    {
        if (Storage::disk(Document::storageDisk())->exists($document->path)) {
            Storage::disk(Document::storageDisk())->delete($document->path);
        }

        return $document->delete();
    }

}

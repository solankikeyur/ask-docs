<?php

namespace App\Actions\Document;

use App\DTOs\Document\UploadDocumentDTO;
use App\Models\Document;
use App\Models\User;
use App\Jobs\ProcessDocument;
use Illuminate\Support\Str;

class StoreDocumentAction
{
    public function execute(UploadDocumentDTO $dto, User $user): Document
    {
        $file = $dto->file;
        $name = $file->getClientOriginalName();
        $size = $this->formatBytes($file->getSize());
        $type = $file->getClientOriginalExtension();

        $path = $file->store(Document::STORAGE_FOLDER, Document::storageDisk());

        $document = Document::create([
            'user_id' => $user->id,
            'name' => $name,
            'path' => $path,
            'size' => $size,
            'type' => $type,
            'status' => Document::STATUS_PROCESSING,
        ]);

        ProcessDocument::dispatch($document);

        return $document;
    }

    protected function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);

        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}

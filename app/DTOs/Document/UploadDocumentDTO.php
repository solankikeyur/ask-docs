<?php

namespace App\DTOs\Document;

use App\Http\Requests\Document\StoreDocumentRequest;
use Illuminate\Http\UploadedFile;

final readonly class UploadDocumentDTO
{
    public function __construct(
        public UploadedFile $file,
    ) {}

    public static function fromRequest(StoreDocumentRequest $request): self
    {
        return new self($request->file('document'));
    }
}

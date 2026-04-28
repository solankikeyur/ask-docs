<?php

namespace App\Http\Requests\Document;

use Illuminate\Foundation\Http\FormRequest;

class StoreDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Admin check in middleware
    }

    public function rules(): array
    {
        return [
            'document' => 'required|file|mimes:pdf,doc,docx,txt|max:51200',
        ];
    }
}

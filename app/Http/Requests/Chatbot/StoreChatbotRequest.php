<?php

namespace App\Http\Requests\Chatbot;

use Illuminate\Foundation\Http\FormRequest;

class StoreChatbotRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'document_ids' => 'nullable|array',
            'document_ids.*' => 'exists:documents,id',
            'settings' => 'nullable|array',
        ];
    }
}

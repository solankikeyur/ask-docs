<?php

namespace App\Http\Requests\Chat;

use Illuminate\Foundation\Http\FormRequest;

class StoreChatRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorization handled in controller/policy
    }

    public function rules(): array
    {
        return [
            'document_id' => 'required|uuid|exists:documents,id',
            'content' => 'required|string|max:10000',
            'chat_id' => 'nullable|uuid|exists:chats,id',
        ];
    }
}

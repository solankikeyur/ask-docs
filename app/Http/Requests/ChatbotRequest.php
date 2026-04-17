<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ChatbotRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Controller handles authorization
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'document_ids' => 'array',
            'document_ids.*' => 'integer|exists:documents,id',
            'settings' => 'nullable|array',
            'settings.primary_color' => ['nullable', 'string', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            'settings.welcome_title' => 'nullable|string|max:255',
            'settings.welcome_subtitle' => 'nullable|string|max:255',
            'settings.system_prompt' => 'nullable|string|max:2000',
            'settings.header_logo' => 'nullable|url|max:2048',
            'settings.allowed_domains' => 'nullable|array|max:20',
            'settings.allowed_domains.*' => 'string|max:255',
            'settings.starter_questions' => 'nullable|array|max:10',
            'settings.starter_questions.*' => 'string|max:255',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'settings.primary_color.regex' => 'The primary color must be a valid hex color code (e.g., #4f46e5).',
            'settings.header_logo.url' => 'The header logo must be a valid URL.',
        ];
    }
}

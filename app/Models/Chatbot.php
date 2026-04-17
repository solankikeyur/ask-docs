<?php

namespace App\Models;

use App\Contracts\DocumentContextSource;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Collection;

class Chatbot extends Model implements DocumentContextSource
{
    protected $fillable = ['user_id', 'name', 'description', 'public_id', 'settings'];

    protected $casts = [
        'settings' => 'array',
    ];
    protected static function booted(): void
    {
        static::creating(function (Chatbot $chatbot) {
            if (empty($chatbot->public_id)) {
                $chatbot->public_id = (string) \Illuminate\Support\Str::uuid();
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function documents(): BelongsToMany
    {
        return $this->belongsToMany(Document::class)
            ->withTimestamps();
    }

    public function chatbotMessages(): HasMany
    {
        return $this->hasMany(ChatbotMessage::class);
    }

    // DocumentContextSource implementation
    public function getAssignedDocumentIds(): array
    {
        return $this->documents()->pluck('documents.id')->toArray();
    }

    public function messages(): Collection
    {
        $query = $this->chatbotMessages();
        
        if (isset($this->current_session_id)) {
            $query->where('session_id', $this->current_session_id);
        }

        // For consistency with Chat model, return latest 50 messages
        return $query
            ->latest('id')
            ->limit(50)
            ->get()
            ->reverse();
    }

    public function getSystemInstruction(): ?string
    {
        return $this->settings['system_prompt'] ?? null;
    }
}
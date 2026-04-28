<?php

namespace App\Models;

use App\Contracts\DocumentContextSource;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Collection;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Chatbot extends Model implements DocumentContextSource
{
    use HasUuids;

    protected $fillable = ['user_id', 'name', 'description', 'settings'];

    protected $casts = [
        'settings' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function documents(): BelongsToMany
    {
        return $this->belongsToMany(Document::class)
            ->using(ChatbotDocument::class)
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

    public function isDomainAllowed(?string $origin): bool
    {
        $settings = $this->settings ?? [];
        $allowedDomains = $settings['allowed_domains'] ?? [];

        if (!is_array($allowedDomains) || count($allowedDomains) === 0) {
            return true; // No restrictions
        }

        $originHost = $origin ? parse_url($origin, PHP_URL_HOST) : null;
        
        if (!$originHost) {
            return false;
        }

        $cleanedDomains = array_filter(array_map(function($d) {
            return rtrim(preg_replace('#^https?://#', '', trim($d)), '/');
        }, $allowedDomains));
        
        return in_array($originHost, $cleanedDomains);
    }
}
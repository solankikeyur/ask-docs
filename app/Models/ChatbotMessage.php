<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ChatbotMessage extends Model
{
    use HasUuids;
    protected $fillable = ['chatbot_id', 'session_id', 'role', 'content', 'metadata'];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function chatbot(): BelongsTo
    {
        return $this->belongsTo(Chatbot::class);
    }
}
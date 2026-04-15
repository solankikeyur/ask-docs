<?php

namespace App\Models;

use App\Contracts\DocumentContextSource;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Collection;

class Chat extends Model implements DocumentContextSource
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'document_id',
        'title',
    ];

    /**
     * Get the user that owns the chat.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the document the chat is grounded in.
     */
    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }

    /**
     * Get the messages for the chat.
     */
    public function messageRecords(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    // DocumentContextSource implementation
    public function getAssignedDocumentIds(): array
    {
        return [$this->document_id];
    }

    public function messages(): Collection
    {
        return $this->messageRecords()->orderBy('id')->get();
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Document extends Model
{
    use HasFactory;

    const STATUS_READY = 'ready';
    const STATUS_PROCESSING = 'processing';
    const STATUS_FAILED = 'failed';

    protected $fillable = [
        'name',
        'path',
        'size',
        'type',
        'status',
    ];

    /**
     * Get the chunks for the document.
     */
    public function chunks(): HasMany
    {
        return $this->hasMany(DocumentChunk::class);
    }
}

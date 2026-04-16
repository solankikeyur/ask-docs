<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Document extends Model
{
    use HasFactory;

    const STATUS_READY = 'ready';
    const STATUS_PROCESSING = 'processing';
    const STATUS_FAILED = 'failed';

    /**
     * Folder within the disk where uploaded documents live.
     * e.g. "documents/abc123.pdf"
     */
    const STORAGE_FOLDER = 'documents';

    /**
     * The filesystem disk where documents are stored.
     *
     * Driven by the DOCUMENT_STORAGE_DISK env variable (via filesystems config)
     * so you can switch from 'public' (local) to 's3' / 'r2' in production
     * without touching any application code — only an env change is needed.
     *
     * Default: 'public' (local disk) — matches existing local dev behaviour.
     */
    public static function storageDisk(): string
    {
        return config('filesystems.document_disk', 'public');
    }

    protected $fillable = [
        'user_id',
        'name',
        'path',
        'size',
        'type',
        'status',
    ];

    /**
     * Get the user that owns the document.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Open a readable stream for the stored file on whichever disk is configured.
     *
     * Prefer this over storagePath() so that remote disks (S3, R2, etc.) work
     * correctly — storagePath() only works reliably on local drivers.
     *
     * @return resource
     */
    public function readStream()
    {
        return Storage::disk(self::storageDisk())->readStream($this->path);
    }

    /**
     * Get the chunks for the document.
     */
    public function chunks(): HasMany
    {
        return $this->hasMany(DocumentChunk::class);
    }

    /**
     * The users that have access to the document.
     */
    public function users()
    {
        return $this->belongsToMany(User::class);
    }

    /**
     * Get the chats associated with the document.
     */
    public function chats(): HasMany
    {
        return $this->hasMany(Chat::class);
    }
}

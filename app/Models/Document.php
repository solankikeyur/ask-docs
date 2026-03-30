<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
}

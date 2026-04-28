<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ChatbotDocument extends Pivot
{
    use HasUuids;

    protected $table = 'chatbot_document';

    public $incrementing = false;

    protected $keyType = 'string';
}

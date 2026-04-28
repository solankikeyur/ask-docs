<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class DocumentUser extends Pivot
{
    use HasUuids;

    protected $table = 'document_user';

    public $incrementing = false;

    protected $keyType = 'string';
}

<?php

namespace App\Repositories\Document;

use App\Models\Document;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

class DocumentRepository
{
    public function getPaginatedForUser(User $user, ?string $search = null, int $perPage = 15): LengthAwarePaginator
    {
        $query = $user->isAdmin() 
            ? Document::query() 
            : Document::where(function($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhereHas('users', fn($uq) => $uq->where('users.id', $user->id));
            });

        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        return $query->latest()->paginate($perPage);
    }

    public function findOrFail(string $id): Document
    {
        return Document::findOrFail($id);
    }
}

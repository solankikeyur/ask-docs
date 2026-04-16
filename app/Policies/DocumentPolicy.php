<?php

namespace App\Policies;

use App\Models\Document;
use App\Models\User;
use App\Enums\UserRole;

class DocumentPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Document $document): bool
    {
        if ($user->role === UserRole::ADMIN) {
            return true;
        }

        return $document->user_id === $user->id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Document $document): bool
    {
        if ($user->role === UserRole::ADMIN) {
            return true;
        }

        return $document->user_id === $user->id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Document $document): bool
    {
        if ($user->role === UserRole::ADMIN) {
            return true;
        }

        return $document->user_id === $user->id;
    }

    /**
     * Determine whether the user can download the document.
     */
    public function download(User $user, Document $document): bool
    {
        if ($user->role === UserRole::ADMIN) {
            return true;
        }

        return $document->user_id === $user->id;
    }
}

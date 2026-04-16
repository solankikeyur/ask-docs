<?php

namespace App\Policies;

use App\Models\Chat;
use App\Models\User;
use App\Enums\UserRole;

class ChatPolicy
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
    public function view(User $user, Chat $chat): bool
    {
        if ($user->role === UserRole::ADMIN) {
            return true;
        }

        return $chat->user_id === $user->id;
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
    public function update(User $user, Chat $chat): bool
    {
        if ($user->role === UserRole::ADMIN) {
            return true;
        }

        return $chat->user_id === $user->id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Chat $chat): bool
    {
        if ($user->role === UserRole::ADMIN) {
            return true;
        }

        return $chat->user_id === $user->id;
    }
}

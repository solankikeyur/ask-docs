<?php

namespace App\DTOs\User;

use App\Http\Requests\User\StoreUserRequest;
use App\Enums\UserRole;

final readonly class CreateUserDTO
{
    public function __construct(
        public string $name,
        public string $email,
        public string $password,
        public UserRole $role,
        public bool $status = true,
    ) {}

    public static function fromRequest(StoreUserRequest $request): self
    {
        return new self(
            $request->validated('name'),
            $request->validated('email'),
            $request->validated('password'),
            UserRole::from($request->validated('role')),
            $request->validated('status', true),
        );
    }
}

<?php

namespace App\Http\Controllers;

use App\DTOs\User\CreateUserDTO;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Resources\Document\DocumentResource;
use App\Http\Resources\User\UserResource;
use App\Models\Document;
use App\Models\User;
use App\Repositories\User\UserRepository;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function __construct(
        protected UserRepository $userRepository
    ) {}

    public function index(): Response
    {
        return Inertia::render('users/index', [
            'users' => UserResource::collection($this->userRepository->all()),
            'allDocuments' => DocumentResource::collection(Document::all(['id', 'name'])),
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $dto = CreateUserDTO::fromRequest($request);

        $this->userRepository->create([
            'name' => $dto->name,
            'email' => $dto->email,
            'password' => $dto->password,
            'role' => $dto->role,
            'status' => $dto->status,
        ]);

        return redirect()->back();
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'status' => 'required|boolean',
        ]);

        $this->userRepository->update($user, $validated);

        return redirect()->back();
    }

    public function destroy(User $user): RedirectResponse
    {
        $this->userRepository->delete($user);
        
        return redirect()->back();
    }
}

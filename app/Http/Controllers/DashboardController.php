<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\Chatbot;
use App\Models\Document;
use App\Models\Chat;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $isAdmin = $user->isAdmin();

        $stats = [
            'documentsUploaded' => $isAdmin ? Document::count() : Document::where(function($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhereHas('users', fn($uq) => $uq->where('users.id', $user->id));
            })->count(),
            'chatbotsCreated' => $isAdmin ? Chatbot::count() : $user->chatbots()->count(),
            'activeChatsToday' => ($isAdmin ? Chat::query() : $user->chats())
                ->whereDate('created_at', now()->toDateString())
                ->count(),
        ];

        if ($isAdmin) {
            $stats['usersCreated'] = User::where('role', UserRole::VIEWER)->count();
        }

        return Inertia::render('dashboard/index', [
            'stats' => $stats,
        ]);
    }
}

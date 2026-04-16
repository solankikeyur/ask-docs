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
        $isAdmin = $user->role === UserRole::ADMIN;

        $stats = [
            'documentsUploaded' => $isAdmin ? Document::count() : $user->documents()->count(),
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

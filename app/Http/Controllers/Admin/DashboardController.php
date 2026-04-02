<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\Message;
use App\Models\User;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $now = now();
        $startOfTodayUtc = $now->copy()->startOfDay()->utc();
        $endOfTodayUtc = $now->copy()->endOfDay()->utc();

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'documentsUploaded' => Document::count(),
                'usersCreated' => User::where('role', UserRole::VIEWER)->count(),
                'activeChatsToday' => Message::query()
                    ->whereBetween('created_at', [$startOfTodayUtc, $endOfTodayUtc])
                    ->select('chat_id')
                    ->distinct()
                    ->count('chat_id'),
            ],
        ]);
    }
}

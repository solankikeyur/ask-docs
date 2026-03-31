<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\Admin\DocumentController;
use App\Http\Controllers\Admin\UserController;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // User routes
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::inertia('chat', 'chat')->name('chat');
    Route::get('chat/new', fn () => inertia('chat-empty'))->name('chat.empty');
    Route::inertia('documents', 'dashboard')->name('documents');

    // Admin routes
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::inertia('/', 'admin/dashboard')->name('dashboard');
        Route::get('/documents', [DocumentController::class, 'index'])->name('documents');
        Route::post('/documents', [DocumentController::class, 'store'])->name('documents.store');
        Route::post('/documents/{document}/assign', [DocumentController::class, 'assign'])->name('documents.assign');
        Route::delete('/documents/{document}', [DocumentController::class, 'destroy'])->name('documents.destroy');
        
        // User management
        Route::get('/users', [UserController::class, 'index'])->name('users');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
        Route::post('/users/{user}/access', [UserController::class, 'updateAccess'])->name('users.access');

        Route::inertia('/chat', 'admin/chat')->name('chat');
    });
});

require __DIR__.'/settings.php';

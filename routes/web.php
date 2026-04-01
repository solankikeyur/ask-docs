<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\Admin\DocumentController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\ChatController;
use App\Http\Controllers\User\ChatController as UserChatController;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Viewer routes (normal users)
    Route::middleware('viewer')->group(function () {
        Route::get('/chat', [UserChatController::class, 'index'])->name('user.chat');
        Route::get('/chat/{chat}', [UserChatController::class, 'show'])->name('user.chat.show');
        Route::post('/chat', [UserChatController::class, 'store'])->name('user.chat.store');
        Route::put('/chat/{chat}', [UserChatController::class, 'update'])->name('user.chat.update');
        Route::delete('/chat/{chat}', [UserChatController::class, 'destroy'])->name('user.chat.destroy');
    });

    // Admin routes (admin-only app)
    Route::prefix('admin')->name('admin.')->middleware('admin')->group(function () {
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

        Route::get('/chat', [ChatController::class, 'index'])->name('chat');
        Route::get('/chat/{chat}', [ChatController::class, 'show'])->name('chat.show');
        Route::post('/chat', [ChatController::class, 'store'])->name('chat.store');
        Route::put('/chat/{chat}', [ChatController::class, 'update'])->name('chat.update');
        Route::delete('/chat/{chat}', [ChatController::class, 'destroy'])->name('chat.destroy');
    });
});

require __DIR__.'/settings.php';

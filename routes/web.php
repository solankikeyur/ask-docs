<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\ChatbotController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DashboardController;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

// Legacy Redirects
Route::get('/admin/documents', fn() => redirect('/documents'));

Route::middleware(['auth', 'verified'])->group(function () {
    
    // Dashboard (Home for all users)
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Document Management
    Route::get('/documents', [DocumentController::class, 'index'])->name('documents.index');
    Route::post('/documents', [DocumentController::class, 'store'])->name('documents.store');
    Route::get('/documents/{document}/download', [DocumentController::class, 'download'])->name('documents.download');
    Route::delete('/documents/{document}', [DocumentController::class, 'destroy'])->name('documents.destroy');

    // Chatbot Management
    Route::resource('chatbots', ChatbotController::class);
    Route::get('/chatbots/{chatbot}/sessions/{sessionId}', [ChatbotController::class, 'getTranscript'])->name('chatbots.transcript');

    // Chat Interface
    Route::get('/chat', [ChatController::class, 'index'])->name('chat.index');
    Route::get('/chat/{chat}', [ChatController::class, 'show'])->name('chat.show');
    Route::post('/chat', [ChatController::class, 'store'])->name('chat.store');
    Route::delete('/chat', [ChatController::class, 'destroyAll'])->name('chat.destroyAll');
    Route::put('/chat/{chat}', [ChatController::class, 'update'])->name('chat.update');
    Route::delete('/chat/{chat}', [ChatController::class, 'destroy'])->name('chat.destroy');

    // Admin-only: User management
    Route::prefix('admin')->name('admin.')->middleware('admin')->group(function () {
        Route::get('/users', [UserController::class, 'index'])->name('users');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
    });
});

require __DIR__.'/settings.php';

// Public chatbot widget
Route::get('/chatbot/{publicId}/widget.js', function (string $publicId) {
    $chatbot = \App\Models\Chatbot::where('public_id', $publicId)->firstOrFail();

    $widgetService = app(\App\Services\ChatbotWidgetService::class);
    $script = $widgetService->generateWidgetScript($chatbot);

    return response($script, 200, [
        'Content-Type' => 'application/javascript',
        'Cache-Control' => 'no-cache, no-store, must-revalidate',
        'Pragma' => 'no-cache',
        'Expires' => '0'
    ]);
})->name('chatbot.widget');

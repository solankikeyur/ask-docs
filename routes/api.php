<?php

use App\Http\Controllers\Api\PublicChatController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Public chatbot API (no authentication needed for embedding)
Route::post('/chat/{publicId}', [PublicChatController::class, 'store'])
    ->middleware('throttle:60,1')
    ->name('api.chat.store');
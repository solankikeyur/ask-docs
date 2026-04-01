<?php

use App\Enums\UserRole;
use App\Models\Chat;
use App\Models\Document;
use App\Models\Message;
use App\Models\User;

it('viewer can clear all their chats', function () {
    $viewer = User::factory()->create([
        'role' => UserRole::VIEWER,
    ]);

    $otherUser = User::factory()->create([
        'role' => UserRole::VIEWER,
    ]);

    $docA = Document::create([
        'name' => 'DocA',
        'path' => '/tmp/doc-a.txt',
        'size' => '1kb',
        'type' => 'text/plain',
        'status' => Document::STATUS_READY,
    ]);

    $docB = Document::create([
        'name' => 'DocB',
        'path' => '/tmp/doc-b.txt',
        'size' => '1kb',
        'type' => 'text/plain',
        'status' => Document::STATUS_READY,
    ]);

    $viewerChat1 = Chat::create([
        'user_id' => $viewer->id,
        'document_id' => $docA->id,
        'title' => 'First',
    ]);

    $viewerChat2 = Chat::create([
        'user_id' => $viewer->id,
        'document_id' => $docB->id,
        'title' => 'Second',
    ]);

    $viewerChat1->messages()->create([
        'role' => 'user',
        'content' => 'Hello',
    ]);

    $viewerChat2->messages()->create([
        'role' => 'assistant',
        'content' => 'Hi',
    ]);

    $otherChat = Chat::create([
        'user_id' => $otherUser->id,
        'document_id' => $docA->id,
        'title' => 'Other',
    ]);

    $this->actingAs($viewer)
        ->delete('/chat')
        ->assertRedirect(route('user.chat'));

    expect(Chat::where('user_id', $viewer->id)->count())->toBe(0);
    expect(Message::whereIn('chat_id', [$viewerChat1->id, $viewerChat2->id])->count())->toBe(0);
    expect(Chat::whereKey($otherChat->id)->exists())->toBeTrue();
});

it('admin can clear all their chats', function () {
    $admin = User::factory()->create([
        'role' => UserRole::ADMIN,
    ]);

    $doc = Document::create([
        'name' => 'DocA',
        'path' => '/tmp/doc-a.txt',
        'size' => '1kb',
        'type' => 'text/plain',
        'status' => Document::STATUS_READY,
    ]);

    $chat = Chat::create([
        'user_id' => $admin->id,
        'document_id' => $doc->id,
        'title' => 'Admin chat',
    ]);

    $chat->messages()->create([
        'role' => 'user',
        'content' => 'Test',
    ]);

    $this->actingAs($admin)
        ->delete('/admin/chat')
        ->assertRedirect(route('admin.chat'));

    expect(Chat::where('user_id', $admin->id)->count())->toBe(0);
    expect(Message::where('chat_id', $chat->id)->count())->toBe(0);
});


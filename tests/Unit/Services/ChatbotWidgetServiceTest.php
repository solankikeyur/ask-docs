<?php

use App\Models\Chatbot;
use App\Services\ChatbotWidgetService;

test('chatbot widget service generates valid javascript', function () {
    $chatbot = Chatbot::factory()->create([
        'name' => 'Test Chatbot',
        'public_id' => 'test-public-id'
    ]);

    $service = new ChatbotWidgetService();
    $script = $service->generateWidgetScript($chatbot);

    expect($script)
        ->toContain('test-public-id')
        ->toContain('Test Chatbot')
        ->toContain('function()')
        ->toContain('document.getElementById')
        ->toContain('fetch(apiUrl')
        ->toContain('loadMarked')
        ->toContain('marked@12.0.0')
        ->toContain('String.fromCharCode(10)')
        ->toContain('innerHTML');
});
<?php

namespace App\Services;

use App\Models\Chatbot;

class ChatbotWidgetService
{
    /**
     * Generate the chatbot widget JavaScript for embedding
     */
    public function generateWidgetScript(Chatbot $chatbot): string
    {
        $javascript = file_get_contents(resource_path('views/chatbot/widget.js'));
        $css = file_get_contents(resource_path('views/chatbot/widget.css'));

        // Replace placeholders with actual values
        $script = str_replace([
            '__CHATBOT_ID__',
            '__CHATBOT_NAME__',
            '__WIDGET_CSS__'
        ], [
            $chatbot->public_id,
            addslashes($chatbot->name),
            $css
        ], $javascript);

        return $script;
    }
}
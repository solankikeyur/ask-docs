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

        $settings = $chatbot->settings ?? [];
        $primaryColor = $settings['primary_color'] ?? '#4f46e5';
        $welcomeTitle = $settings['welcome_title'] ?? $chatbot->name;
        $welcomeSubtitle = $settings['welcome_subtitle'] ?? 'Ask questions about your documents';
        
        $css = str_replace('__PRIMARY_COLOR__', $primaryColor, $css);

        $starterQuestions = $settings['starter_questions'] ?? [];
        $starterQuestionsJson = json_encode(is_array($starterQuestions) ? array_values(array_filter($starterQuestions)) : []);

        // Replace placeholders with actual values
        $script = str_replace([
            '__CHATBOT_ID__',
            '__CHATBOT_NAME__',
            '__WELCOME_TITLE__',
            '__WELCOME_SUBTITLE__',
            '__WIDGET_CSS__',
            '__STARTER_QUESTIONS__'
        ], [
            $chatbot->public_id,
            addslashes($chatbot->name),
            addslashes($welcomeTitle),
            addslashes($welcomeSubtitle),
            $css,
            $starterQuestionsJson
        ], $javascript);

        return $script;
    }
}
<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default AI Provider Names
    |--------------------------------------------------------------------------
    |
    | Here you may specify which of the AI providers below should be the
    | default for AI operations when no explicit provider is provided
    | for the operation. This should be any provider defined below.
    |
    */

    'default' => 'openai',
    'default_for_images' => 'gemini',
    'default_for_audio' => 'openai',
    'default_for_transcription' => 'openai',
    'default_for_embeddings' => 'openai',
    'default_for_reranking' => 'cohere',

    /*
    |--------------------------------------------------------------------------
    | Caching
    |--------------------------------------------------------------------------
    |
    | Below you may configure caching strategies for AI related operations
    | such as embedding generation. You are free to adjust these values
    | based on your application's available caching stores and needs.
    |
    */

    'caching' => [
        'embeddings' => [
            'cache' => false,
            'store' => env('CACHE_STORE', 'database'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | AI Providers
    |--------------------------------------------------------------------------
    |
    | Below are each of your AI providers defined for this application. Each
    | represents an AI provider and API key combination which can be used
    | to perform tasks like text, image, and audio creation via agents.
    |
    */

    'providers' => [
        'anthropic' => [
            'driver' => 'anthropic',
            'key' => env('ANTHROPIC_API_KEY'),
        ],

        'azure' => [
            'driver' => 'azure',
            'key' => env('AZURE_OPENAI_API_KEY'),
            'url' => env('AZURE_OPENAI_URL'),
            'api_version' => env('AZURE_OPENAI_API_VERSION', '2024-10-21'),
            'deployment' => env('AZURE_OPENAI_DEPLOYMENT', 'gpt-4o'),
            'embedding_deployment' => env('AZURE_OPENAI_EMBEDDING_DEPLOYMENT', 'text-embedding-3-small'),
        ],

        'cohere' => [
            'driver' => 'cohere',
            'key' => env('COHERE_API_KEY'),
        ],

        'deepseek' => [
            'driver' => 'deepseek',
            'key' => env('DEEPSEEK_API_KEY'),
        ],

        'eleven' => [
            'driver' => 'eleven',
            'key' => env('ELEVENLABS_API_KEY'),
        ],

        'gemini' => [
            'driver' => 'gemini',
            'key' => env('GEMINI_API_KEY'),
        ],

        'groq' => [
            'driver' => 'groq',
            'key' => env('GROQ_API_KEY'),
        ],

        'jina' => [
            'driver' => 'jina',
            'key' => env('JINA_API_KEY'),
        ],

        'mistral' => [
            'driver' => 'mistral',
            'key' => env('MISTRAL_API_KEY'),
        ],

        'ollama' => [
            'driver' => 'ollama',
            'key' => env('OLLAMA_API_KEY', ''),
            'url' => env('OLLAMA_BASE_URL', 'http://localhost:11434'),
        ],

        'openai' => [
            'driver' => 'openai',
            'key' => env('OPENAI_API_KEY'),
            'url' => env('OPENAI_URL', 'https://api.openai.com/v1'),
        ],

        'openrouter' => [
            'driver' => 'openrouter',
            'key' => env('OPENROUTER_API_KEY'),
        ],

        'voyageai' => [
            'driver' => 'voyageai',
            'key' => env('VOYAGEAI_API_KEY'),
        ],

        'xai' => [
            'driver' => 'xai',
            'key' => env('XAI_API_KEY'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | RAG & Retrieval Settings
    |--------------------------------------------------------------------------
    |
    | Below are the settings for the RAG (Retrieval Augmented Generation) 
    | pipeline, including models, search thresholds, and limits.
    |
    */

    'rag' => [
        'models' => [
            'completion' => env('AI_COMPLETION_MODEL', 'gpt-4o-mini-2024-07-18'),
            'embedding'  => env('AI_EMBEDDING_MODEL', 'text-embedding-3-small'),
            'expansion'  => env('AI_EXPANSION_MODEL', 'gpt-4o-mini-2024-07-18'),
        ],

        'retrieval' => [
            'dimensions'           => (int) env('AI_EMBEDDING_DIMENSIONS', 1536),
            'similarity_threshold' => (float) env('AI_SIMILARITY_THRESHOLD', 0.35),
            'candidate_limit'      => (int) env('AI_RERANK_CANDIDATE_LIMIT', 25),
            'context_limit'        => (int) env('AI_CONTEXT_CHUNK_LIMIT', 6),
            'search_limit'         => (int) env('AI_SEARCH_LIMIT', 100),
            'expansion_count'      => (int) env('AI_EXPANSION_COUNT', 3),
        ],

        'rerank' => [
            'enabled'      => (bool) env('AI_RERANK_ENABLED', true),
            'max_chars'    => (int) env('AI_RERANK_MAX_CHARS', 1000),
            'cache_expiry' => (int) env('AI_RERANK_CACHE_EXPIRY', 600), // In seconds
            'timeout'      => (int) env('AI_RERANK_TIMEOUT', 8),
            'retries'      => (int) env('AI_RERANK_RETRIES', 2),
            'score_threshold' => (float) env('AI_RERANK_SCORE_THRESHOLD', 0.3),
        ],

        'timeouts' => [
            'completion' => (int) env('AI_COMPLETION_TIMEOUT', 20),
            'expansion'  => (int) env('AI_EXPANSION_TIMEOUT', 10),
        ],

        'limits' => [
            'pagination'   => (int) env('AI_PAGINATION_LIMIT', 100),
            'max_message'  => (int) env('AI_MAX_MESSAGE_LENGTH', 10000),
        ],
    ],

];

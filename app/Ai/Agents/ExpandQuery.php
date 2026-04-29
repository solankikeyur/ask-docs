<?php

namespace App\Ai\Agents;

use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Promptable;
use Stringable;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Illuminate\Contracts\JsonSchema\JsonSchema;

class ExpandQuery implements Agent, HasStructuredOutput
{
    use Promptable;

    /**
     * Get the instructions that the agent should follow.
     */
    public function instructions(): Stringable|string
    {
        return <<<EOT
You are an AI assistant specialized in search query expansion for RAG systems.
Your goal is to take a user question and generate 3 variations that help find the most relevant information in a document database.

Rules:
1. Use different terminology, synonyms, and phrasings.
2. Include versions optimized for both semantic meaning and keyword matching.
3. Keep the variations concise and focused on the core information need.
4. Output ONLY the variations, one per line. No numbering, no introductory text.
EOT;
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'queries' => $schema->array()->items(
                $schema->string()
            )->required(),
        ];
    }
}

<?php

namespace App\Support\AiChat\Tools;

/**
 * A JSON-Schema tool definition sent to the AI provider so the model knows
 * what tools are available and how to call them.
 */
final readonly class ToolSchema
{
    /**
     * @param  array<string, mixed>  $parameters  JSON Schema for the tool's arguments object.
     */
    public function __construct(
        public string $name,
        public string $description,
        public array $parameters,
    ) {}
}

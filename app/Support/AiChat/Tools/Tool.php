<?php

namespace App\Support\AiChat\Tools;

use App\Models\Team;

interface Tool
{
    /**
     * Get the tool's machine name, as sent to the AI provider.
     */
    public function name(): string;

    /**
     * Get a human-readable description of what this tool does, shown to the model.
     */
    public function description(): string;

    /**
     * Get the JSON Schema for this tool's arguments object.
     *
     * @return array<string, mixed>
     */
    public function parameters(): array;

    /**
     * Execute the tool, scoped to the given team. Arguments come directly
     * from the model and may be malformed or missing required keys —
     * implementations must validate defensively and return a structured
     * `{error: string}` array instead of throwing when args are invalid.
     *
     * @param  array<string, mixed>  $args
     * @return array<string, mixed>
     */
    public function execute(Team $team, array $args): array;
}

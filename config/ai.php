<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default AI Text Generation Provider
    |--------------------------------------------------------------------------
    |
    | Which provider to use for AI-assisted text generation (e.g. proposal
    | drafting). Supported: "openai", "anthropic", "deepseek". Switching
    | providers only requires changing this value and the matching API key
    | in config/services.php — no code changes needed.
    |
    */

    'provider' => env('AI_PROVIDER', 'openai'),

];

<?php

namespace App\Support\Ai;

class DeepSeekTextGenerator extends OpenAiTextGenerator
{
    public function __construct(?string $apiKey, string $model)
    {
        parent::__construct($apiKey, $model, 'https://api.deepseek.com', 'DeepSeek');
    }
}

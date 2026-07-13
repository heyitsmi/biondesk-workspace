<?php

namespace App\Support\AiChat;

class DeepSeekChatClient extends OpenAiChatClient
{
    public function __construct(?string $apiKey, string $model)
    {
        parent::__construct($apiKey, $model, 'https://api.deepseek.com', 'DeepSeek');
    }
}

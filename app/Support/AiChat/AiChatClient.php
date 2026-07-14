<?php

namespace App\Support\AiChat;

use App\Support\AiChat\Tools\ToolSchema;

interface AiChatClient
{
    /**
     * Send the full conversation history (and available tools) to the AI
     * provider and get back either a text reply or a request to call tools.
     *
     * @param  list<AiChatMessage>  $messages
     * @param  list<ToolSchema>  $tools
     *
     * @throws AiChatException when the provider is unconfigured or the request fails.
     */
    public function send(string $systemPrompt, array $messages, array $tools): AiChatResult;
}

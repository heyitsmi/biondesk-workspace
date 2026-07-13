<?php

namespace App\Enums;

enum BionAiMessageRole: string
{
    case User = 'user';
    case Assistant = 'assistant';
    case Tool = 'tool';
}

<?php

// Approximate USD price per 1,000,000 tokens, keyed by provider then by the
// exact model string configured in config/services.php's *.model values.
//
// THESE PRICES ARE HARDCODED SNAPSHOTS, NOT FETCHED LIVE — no provider
// exposes pricing via API. They will drift out of date as providers change
// pricing and must be manually refreshed periodically.
//
// A model not listed here falls back to the provider's 'default' entry, a
// deliberately conservative (non-zero) placeholder so an unknown/renamed
// model still produces a plausible cost estimate instead of silently
// logging $0.

return [
    'openai' => [
        'gpt-4o-mini' => ['input' => 0.15, 'output' => 0.60],
        'default' => ['input' => 0.50, 'output' => 1.50],
    ],

    'anthropic' => [
        'claude-3-5-haiku-latest' => ['input' => 0.80, 'output' => 4.00],
        'default' => ['input' => 3.00, 'output' => 15.00],
    ],

    'deepseek' => [
        'deepseek-chat' => ['input' => 0.27, 'output' => 1.10],
        'default' => ['input' => 0.27, 'output' => 1.10],
    ],
];

<?php

namespace App\Enums;

enum WorkflowAutomationRunStatus: string
{
    case Success = 'success';
    case Skipped = 'skipped';
    case Failed = 'failed';

    /**
     * Get the display label for the run status.
     */
    public function label(): string
    {
        return match ($this) {
            self::Success => 'Success',
            self::Skipped => 'Skipped',
            self::Failed => 'Failed',
        };
    }

    /**
     * Get the status pill tone.
     */
    public function tone(): string
    {
        return match ($this) {
            self::Success => 'success',
            self::Skipped => 'muted',
            self::Failed => 'danger',
        };
    }
}

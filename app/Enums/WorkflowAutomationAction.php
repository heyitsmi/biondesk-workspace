<?php

namespace App\Enums;

enum WorkflowAutomationAction: string
{
    case CreateTask = 'create_task';
    case CreateCalendarEvent = 'create_calendar_event';
    case UpdateRequestStatus = 'update_request_status';
    case UpdateProjectStatus = 'update_project_status';
    case AddActivityLog = 'add_activity_log';

    /**
     * Get the display label for the action.
     */
    public function label(): string
    {
        return match ($this) {
            self::CreateTask => 'Create task',
            self::CreateCalendarEvent => 'Create calendar event',
            self::UpdateRequestStatus => 'Update request status',
            self::UpdateProjectStatus => 'Update project status',
            self::AddActivityLog => 'Add activity log',
        };
    }
}

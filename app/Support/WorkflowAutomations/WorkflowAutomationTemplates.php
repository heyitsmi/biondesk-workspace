<?php

namespace App\Support\WorkflowAutomations;

use App\Enums\ProjectStatus;
use App\Enums\RequestLogStatus;
use App\Enums\TaskStatus;
use App\Enums\WorkflowAutomationAction;
use App\Enums\WorkflowAutomationTrigger;

class WorkflowAutomationTemplates
{
    /**
     * Get all built-in workflow automation templates.
     *
     * @return array<int, array<string, mixed>>
     */
    public function all(): array
    {
        return [
            [
                'key' => 'new_client_request_task',
                'name' => 'New client request -> create triage task',
                'description' => 'Create an internal task when a client submits a new request through the portal.',
                'trigger' => WorkflowAutomationTrigger::ClientRequestSubmitted->value,
                'triggerLabel' => WorkflowAutomationTrigger::ClientRequestSubmitted->label(),
                'conditions' => [],
                'actions' => [[
                    'type' => WorkflowAutomationAction::CreateTask->value,
                    'title' => 'Triage client request: {{request_preview}}',
                    'description' => "Review the new client request and decide whether it should become project work.\n\n{{request_text}}",
                    'status' => TaskStatus::Todo->value,
                    'tags' => ['automation', 'client-request'],
                ]],
                'summary' => 'When a client submits a request, create a triage task.',
            ],
            [
                'key' => 'client_reply_follow_up_task',
                'name' => 'Client replied -> create follow-up task',
                'description' => 'Create a follow-up task whenever a client replies to an existing request thread.',
                'trigger' => WorkflowAutomationTrigger::ClientRequestReplied->value,
                'triggerLabel' => WorkflowAutomationTrigger::ClientRequestReplied->label(),
                'conditions' => [],
                'actions' => [[
                    'type' => WorkflowAutomationAction::CreateTask->value,
                    'title' => 'Follow up client reply: {{request_preview}}',
                    'description' => "Client replied on a request thread.\n\n{{message_body}}",
                    'status' => TaskStatus::Todo->value,
                    'tags' => ['automation', 'follow-up'],
                ]],
                'summary' => 'When a client replies, create a follow-up task.',
            ],
            [
                'key' => 'request_submitted_reviewing',
                'name' => 'Request submitted -> set status to Reviewing',
                'description' => 'Move newly submitted client requests into Reviewing automatically.',
                'trigger' => WorkflowAutomationTrigger::ClientRequestSubmitted->value,
                'triggerLabel' => WorkflowAutomationTrigger::ClientRequestSubmitted->label(),
                'conditions' => [],
                'actions' => [[
                    'type' => WorkflowAutomationAction::UpdateRequestStatus->value,
                    'status' => RequestLogStatus::Reviewing->value,
                ]],
                'summary' => 'When a client submits a request, mark it Reviewing.',
            ],
            [
                'key' => 'project_waiting_on_client_followup',
                'name' => 'Project waiting on client -> create follow-up event',
                'description' => 'Add a calendar follow-up after a project is moved to Waiting on Client.',
                'trigger' => WorkflowAutomationTrigger::ProjectStatusChanged->value,
                'triggerLabel' => WorkflowAutomationTrigger::ProjectStatusChanged->label(),
                'conditions' => ['status' => ProjectStatus::WaitingOnClient->value],
                'actions' => [[
                    'type' => WorkflowAutomationAction::CreateCalendarEvent->value,
                    'title' => 'Follow up with {{contact_name}} about {{project_title}}',
                    'description' => 'Automation reminder created because the project is waiting on the client.',
                    'delay_days' => 2,
                ]],
                'summary' => 'When a project waits on client, create a follow-up event.',
            ],
            [
                'key' => 'invoice_overdue_task',
                'name' => 'Invoice overdue -> create follow-up task',
                'description' => 'Create an internal follow-up task for overdue invoices linked to a project.',
                'trigger' => WorkflowAutomationTrigger::InvoiceOverdue->value,
                'triggerLabel' => WorkflowAutomationTrigger::InvoiceOverdue->label(),
                'conditions' => [],
                'actions' => [[
                    'type' => WorkflowAutomationAction::CreateTask->value,
                    'title' => 'Follow up overdue invoice {{document_number}}',
                    'description' => 'Invoice {{document_number}} is overdue for {{contact_name}}.',
                    'status' => TaskStatus::Todo->value,
                    'tags' => ['automation', 'invoice'],
                ]],
                'summary' => 'When an invoice is overdue, create a follow-up task.',
            ],
            [
                'key' => 'quote_unresponded_task',
                'name' => 'Quote unresponded -> create follow-up task',
                'description' => 'Create an internal follow-up task for quotes whose valid-until date has passed.',
                'trigger' => WorkflowAutomationTrigger::QuoteUnresponded->value,
                'triggerLabel' => WorkflowAutomationTrigger::QuoteUnresponded->label(),
                'conditions' => [],
                'actions' => [[
                    'type' => WorkflowAutomationAction::CreateTask->value,
                    'title' => 'Follow up quote {{document_number}}',
                    'description' => 'Quote {{document_number}} has not received a response from {{contact_name}}.',
                    'status' => TaskStatus::Todo->value,
                    'tags' => ['automation', 'quote'],
                ]],
                'summary' => 'When a quote is unresponded, create a follow-up task.',
            ],
            [
                'key' => 'project_completed_activity',
                'name' => 'Project completed -> add activity log note',
                'description' => 'Add a lightweight activity note when a project reaches Completed.',
                'trigger' => WorkflowAutomationTrigger::ProjectStatusChanged->value,
                'triggerLabel' => WorkflowAutomationTrigger::ProjectStatusChanged->label(),
                'conditions' => ['status' => ProjectStatus::Completed->value],
                'actions' => [[
                    'type' => WorkflowAutomationAction::AddActivityLog->value,
                    'message' => 'Workflow automation: project marked completed. Review final handoff, invoice, and testimonial follow-up.',
                    'tone' => 'success',
                ]],
                'summary' => 'When a project completes, add a checklist note.',
            ],
        ];
    }

    /**
     * Find a built-in template by key.
     *
     * @return array<string, mixed>|null
     */
    public function find(string $key): ?array
    {
        foreach ($this->all() as $template) {
            if ($template['key'] === $key) {
                return $template;
            }
        }

        return null;
    }
}

<?php

namespace App\Support\ClientPortal;

use App\Enums\DocumentStatus;
use App\Enums\ProjectStatus;
use App\Enums\TaskStatus;
use App\Models\Contact;
use App\Models\Document;
use App\Models\Project;
use App\Models\RequestLog;
use App\Models\Task;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class ClientPortalData
{
    /**
     * Build the public client portal payload for a contact.
     *
     * @return array<string, mixed>
     */
    public function forContact(Contact $contact): array
    {
        $contact->loadMissing('team');

        $projects = $this->projectsFor($contact);
        $documents = $this->documentsFor($contact);
        $requests = $projects
            ->flatMap(fn (Project $project) => $project->requestLogs)
            ->sortByDesc('created_at')
            ->values();

        return [
            'portal' => [
                'teamName' => $contact->team->name,
                'portalToken' => $contact->portal_token,
                'contact' => [
                    'name' => $contact->displayName(),
                    'fullName' => $contact->fullName(),
                    'company' => $contact->company,
                    'initials' => $contact->initials(),
                    'email' => $contact->email,
                ],
                'stats' => [
                    'activeProjects' => $projects
                        ->filter(fn (Project $project) => ! in_array($project->status, [ProjectStatus::Completed, ProjectStatus::Cancelled], true))
                        ->count(),
                    'documents' => $documents->count(),
                    'openRequests' => $requests->count(),
                ],
                'projects' => $projects->map(fn (Project $project) => $this->projectArray($project))->all(),
                'documents' => $documents->map(fn (Document $document) => $this->documentArray($document))->all(),
                'requests' => $requests->map(fn (RequestLog $requestLog) => [
                    ...$requestLog->toClientPortalArray(),
                    'projectTitle' => $requestLog->project->title,
                ])->all(),
            ],
        ];
    }

    /**
     * @return Collection<int, Project>
     */
    private function projectsFor(Contact $contact): Collection
    {
        return Project::query()
            ->where('team_id', $contact->team_id)
            ->whereHas('opportunity', fn (Builder $query) => $query->where('contact_id', $contact->id))
            ->with([
                'tasks' => fn ($query) => $query->orderBy('id'),
                'requestLogs' => fn ($query) => $query
                    ->where('visible_to_client', true)
                    ->latest(),
            ])
            ->latest()
            ->get();
    }

    /**
     * @return Collection<int, Document>
     */
    private function documentsFor(Contact $contact): Collection
    {
        return Document::query()
            ->where('team_id', $contact->team_id)
            ->where('contact_id', $contact->id)
            ->where('status', '!=', DocumentStatus::Draft->value)
            ->latest()
            ->get();
    }

    /**
     * @return array<string, mixed>
     */
    private function projectArray(Project $project): array
    {
        $taskCount = $project->tasks->count();
        $doneTaskCount = $project->tasks
            ->filter(fn (Task $task) => $task->status === TaskStatus::Done)
            ->count();

        return [
            'id' => $project->id,
            'title' => $project->title,
            'statusLabel' => $project->status->label(),
            'tone' => $project->status->tone(),
            'dueAt' => $project->due_date?->format('M j, Y') ?? 'No due date',
            'progress' => $taskCount === 0 ? 0 : (int) round($doneTaskCount / $taskCount * 100),
            'tasks' => $project->tasks->map(fn (Task $task) => [
                'id' => $task->id,
                'title' => $task->title,
                'statusLabel' => $task->status->label(),
                'tone' => $task->status->tone(),
            ])->all(),
            'requests' => $project->requestLogs->map->toClientPortalArray()->all(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function documentArray(Document $document): array
    {
        return [
            'id' => $document->id,
            'kind' => $document->type->value === 'quote' ? 'quotation' : $document->type->value,
            'kindLabel' => $document->type->label(),
            'number' => $document->number,
            'title' => $document->title,
            'statusLabel' => $document->displayStatusLabel(),
            'tone' => $document->displayStatusTone(),
            'amount' => $document->formattedTotal(),
            'issuedAt' => $document->issued_at?->format('M j, Y') ?? '',
            'url' => $document->shareUrl(),
        ];
    }
}

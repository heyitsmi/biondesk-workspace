<?php

use App\Enums\RequestLogClassification;
use App\Enums\RequestLogMessageAuthorType;
use App\Enums\RequestLogSource;
use App\Enums\RequestLogStatus;
use App\Models\Contact;
use App\Models\Opportunity;
use App\Models\Project;
use App\Models\RequestLog;
use App\Models\RequestLogMessage;
use App\Models\Task;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

function requestLogTestProject(Team $team): Project
{
    $contact = Contact::factory()->for($team)->create();
    $opportunity = Opportunity::factory()->for($team)->for($contact)->create();

    return Project::factory()->for($team)->for($opportunity)->create();
}

test('a request log can be created with default source and classification', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $project = requestLogTestProject($team);

    $this->actingAs($user)
        ->post(route('projects.request-logs.store', ['current_team' => $team->slug, 'project' => $project->id]), [
            'text' => 'Can we use a darker navy for the logo?',
        ])
        ->assertRedirect();

    $requestLog = RequestLog::sole();
    expect($requestLog->project_id)->toBe($project->id);
    expect($requestLog->uuid)->not->toBeNull();
    expect($requestLog->text)->toBe('Can we use a darker navy for the logo?');
    expect($requestLog->source)->toBe(RequestLogSource::Email);
    expect($requestLog->classification)->toBe(RequestLogClassification::New);
    expect($requestLog->status)->toBe(RequestLogStatus::Submitted);
});

test('a request log detail page can be opened by uuid', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $project = requestLogTestProject($team);
    $requestLog = RequestLog::factory()->for($project)->create([
        'text' => 'Please review the footer spacing.',
        'source' => RequestLogSource::ClientPortal,
        'status' => RequestLogStatus::Reviewing,
    ]);

    $this->actingAs($user)
        ->get(route('projects.request-logs.show', [
            'current_team' => $team->slug,
            'project' => $project->id,
            'requestLog' => $requestLog->uuid,
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('projects/request-log-show')
            ->where('project.id', $project->id)
            ->where('requestLog.uuid', $requestLog->uuid)
            ->where('requestLog.text', 'Please review the footer spacing.')
            ->where('requestLog.source', 'Client portal')
            ->where('requestLog.status', 'reviewing')
        );
});

test('a request log detail page is scoped to the current team project', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $project = requestLogTestProject($team);
    $otherTeam = Team::factory()->create();
    $foreignProject = requestLogTestProject($otherTeam);
    $foreignRequestLog = RequestLog::factory()->for($foreignProject)->create();

    $this->actingAs($user)
        ->get(route('projects.request-logs.show', [
            'current_team' => $team->slug,
            'project' => $project->id,
            'requestLog' => $foreignRequestLog->uuid,
        ]))
        ->assertNotFound();
});

test('a request log can be updated', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $project = requestLogTestProject($team);
    $requestLog = RequestLog::factory()->for($project)->create(['text' => 'Old text']);

    $this->actingAs($user)
        ->put(route('projects.request-logs.update', ['current_team' => $team->slug, 'project' => $project->id, 'requestLog' => $requestLog->id]), [
            'text' => 'New text',
            'source' => 'Telegram',
            'classification' => 'duplicate',
            'status' => 'reviewing',
            'notes' => 'Related to earlier request',
        ])
        ->assertRedirect();

    $requestLog->refresh();
    expect($requestLog->text)->toBe('New text');
    expect($requestLog->source)->toBe(RequestLogSource::Telegram);
    expect($requestLog->classification)->toBe(RequestLogClassification::Duplicate);
    expect($requestLog->status)->toBe(RequestLogStatus::Reviewing);
});

test('a request log can be dismissed', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $project = requestLogTestProject($team);
    $requestLog = RequestLog::factory()->for($project)->create();

    $this->actingAs($user)
        ->delete(route('projects.request-logs.destroy', ['current_team' => $team->slug, 'project' => $project->id, 'requestLog' => $requestLog->id]))
        ->assertRedirect();

    expect(RequestLog::find($requestLog->id))->toBeNull();
});

test('a request log can be converted into a task and is removed', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $project = requestLogTestProject($team);
    $requestLog = RequestLog::factory()->for($project)->create(['text' => 'Can we use a darker navy?', 'notes' => 'From the client call']);

    $this->actingAs($user)
        ->post(route('projects.request-logs.convert-to-task', ['current_team' => $team->slug, 'project' => $project->id, 'requestLog' => $requestLog->id]))
        ->assertRedirect();

    expect(RequestLog::find($requestLog->id))->toBeNull();

    $task = Task::sole();
    expect($task->project_id)->toBe($project->id);
    expect($task->title)->toContain('Can we use a darker navy?');
    expect($task->status->value)->toBe('todo');
});

test('a team cannot update, dismiss, or convert a request log on another team\'s project', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $otherTeam = Team::factory()->create();
    $foreignProject = requestLogTestProject($otherTeam);
    $foreignRequestLog = RequestLog::factory()->for($foreignProject)->create();

    $this->actingAs($user)
        ->put(route('projects.request-logs.update', ['current_team' => $team->slug, 'project' => $foreignProject->id, 'requestLog' => $foreignRequestLog->id]), [
            'text' => 'Hacked',
            'source' => 'Email',
            'classification' => 'new',
            'status' => 'submitted',
        ])
        ->assertNotFound();

    $this->actingAs($user)
        ->post(route('projects.request-logs.convert-to-task', ['current_team' => $team->slug, 'project' => $foreignProject->id, 'requestLog' => $foreignRequestLog->id]))
        ->assertNotFound();

    $this->actingAs($user)
        ->delete(route('projects.request-logs.destroy', ['current_team' => $team->slug, 'project' => $foreignProject->id, 'requestLog' => $foreignRequestLog->id]))
        ->assertNotFound();

    expect($foreignRequestLog->fresh())->not->toBeNull();
    expect($foreignRequestLog->fresh()->text)->not->toBe('Hacked');
});

test('a team can update request status and reply with attachments', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $team = $user->currentTeam;
    $project = requestLogTestProject($team);
    $requestLog = RequestLog::factory()->for($project)->create([
        'status' => RequestLogStatus::Submitted,
    ]);

    $this->actingAs($user)
        ->patch(route('projects.request-logs.status.update', [
            'current_team' => $team->slug,
            'project' => $project->id,
            'requestLog' => $requestLog->id,
        ]), [
            'status' => 'in_progress',
        ])
        ->assertRedirect();

    expect($requestLog->fresh()->status)->toBe(RequestLogStatus::InProgress);

    $this->actingAs($user)
        ->post(route('projects.request-logs.messages.store', [
            'current_team' => $team->slug,
            'project' => $project->id,
            'requestLog' => $requestLog->id,
        ]), [
            'body' => 'We are working on this now.',
            'attachments' => [UploadedFile::fake()->create('update.pdf', 200, 'application/pdf')],
        ])
        ->assertRedirect();

    $message = RequestLogMessage::sole();
    expect($message->request_log_id)->toBe($requestLog->id);
    expect($message->author_type)->toBe(RequestLogMessageAuthorType::Team);
    expect($message->user_id)->toBe($user->id);
    expect($message->body)->toBe('We are working on this now.');
    expect($message->getMedia('attachments'))->toHaveCount(1);
});

test('request status validation rejects invalid values', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $project = requestLogTestProject($team);
    $requestLog = RequestLog::factory()->for($project)->create([
        'status' => RequestLogStatus::Submitted,
    ]);

    $this->actingAs($user)
        ->patch(route('projects.request-logs.status.update', [
            'current_team' => $team->slug,
            'project' => $project->id,
            'requestLog' => $requestLog->id,
        ]), [
            'status' => 'not-real',
        ])
        ->assertSessionHasErrors('status');

    expect($requestLog->fresh()->status)->toBe(RequestLogStatus::Submitted);
});

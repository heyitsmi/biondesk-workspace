<?php

use App\Enums\RequestLogClassification;
use App\Enums\RequestLogSource;
use App\Models\Contact;
use App\Models\Opportunity;
use App\Models\Project;
use App\Models\RequestLog;
use App\Models\Task;
use App\Models\Team;
use App\Models\User;

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
    expect($requestLog->text)->toBe('Can we use a darker navy for the logo?');
    expect($requestLog->source)->toBe(RequestLogSource::Email);
    expect($requestLog->classification)->toBe(RequestLogClassification::New);
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
            'notes' => 'Related to earlier request',
        ])
        ->assertRedirect();

    $requestLog->refresh();
    expect($requestLog->text)->toBe('New text');
    expect($requestLog->source)->toBe(RequestLogSource::Telegram);
    expect($requestLog->classification)->toBe(RequestLogClassification::Duplicate);
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

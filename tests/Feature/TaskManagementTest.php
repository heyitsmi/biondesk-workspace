<?php

use App\Enums\TaskStatus;
use App\Models\Contact;
use App\Models\Opportunity;
use App\Models\Project;
use App\Models\Task;
use App\Models\Team;
use App\Models\User;

function taskTestProject(Team $team): Project
{
    $contact = Contact::factory()->for($team)->create();
    $opportunity = Opportunity::factory()->for($team)->for($contact)->create();

    return Project::factory()->for($team)->for($opportunity)->create();
}

test('a task can be created for a project with a default status of todo', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $project = taskTestProject($team);

    $this->actingAs($user)
        ->post(route('projects.tasks.store', ['current_team' => $team->slug, 'project' => $project->id]), [
            'title' => 'Gather brand assets',
        ])
        ->assertRedirect();

    $task = Task::sole();
    expect($task->project_id)->toBe($project->id);
    expect($task->title)->toBe('Gather brand assets');
    expect($task->status)->toBe(TaskStatus::Todo);
});

test('a task logs an activity entry against the project', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $project = taskTestProject($team);

    $this->actingAs($user)
        ->post(route('projects.tasks.store', ['current_team' => $team->slug, 'project' => $project->id]), [
            'title' => 'Gather brand assets',
        ]);

    expect($project->activitiesAsSubject()->latest('id')->first()->description)->toContain('Gather brand assets');
});

test('a task can be updated with title, status, description, and tags', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $project = taskTestProject($team);
    $task = Task::factory()->for($project)->create(['title' => 'Old title', 'status' => TaskStatus::Todo]);

    $this->actingAs($user)
        ->put(route('projects.tasks.update', ['current_team' => $team->slug, 'project' => $project->id, 'task' => $task->id]), [
            'title' => 'New title',
            'status' => 'in_review',
            'description' => 'Updated description',
            'tags' => ['Design', 'Urgent'],
        ])
        ->assertRedirect();

    $task->refresh();
    expect($task->title)->toBe('New title');
    expect($task->status)->toBe(TaskStatus::InReview);
    expect($task->tags)->toBe(['Design', 'Urgent']);
});

test('a task\'s status can be moved independently via the move endpoint', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $project = taskTestProject($team);
    $task = Task::factory()->for($project)->create(['status' => TaskStatus::Todo]);

    $this->actingAs($user)
        ->patch(route('projects.tasks.move', ['current_team' => $team->slug, 'project' => $project->id, 'task' => $task->id]), [
            'status' => 'done',
        ])
        ->assertRedirect();

    expect($task->fresh()->status)->toBe(TaskStatus::Done);
});

test('a task can be deleted', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $project = taskTestProject($team);
    $task = Task::factory()->for($project)->create();

    $this->actingAs($user)
        ->delete(route('projects.tasks.destroy', ['current_team' => $team->slug, 'project' => $project->id, 'task' => $task->id]))
        ->assertRedirect();

    expect(Task::find($task->id))->toBeNull();
});

test('a team cannot update, move, or delete a task on another team\'s project', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $otherTeam = Team::factory()->create();
    $foreignProject = taskTestProject($otherTeam);
    $foreignTask = Task::factory()->for($foreignProject)->create();

    $this->actingAs($user)
        ->put(route('projects.tasks.update', ['current_team' => $team->slug, 'project' => $foreignProject->id, 'task' => $foreignTask->id]), [
            'title' => 'Hacked',
            'status' => 'done',
        ])
        ->assertNotFound();

    $this->actingAs($user)
        ->patch(route('projects.tasks.move', ['current_team' => $team->slug, 'project' => $foreignProject->id, 'task' => $foreignTask->id]), [
            'status' => 'done',
        ])
        ->assertNotFound();

    $this->actingAs($user)
        ->delete(route('projects.tasks.destroy', ['current_team' => $team->slug, 'project' => $foreignProject->id, 'task' => $foreignTask->id]))
        ->assertNotFound();

    expect($foreignTask->fresh())->not->toBeNull();
    expect($foreignTask->fresh()->title)->not->toBe('Hacked');
});

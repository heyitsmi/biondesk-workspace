<?php

use App\Enums\DocumentStatus;
use App\Enums\DocumentType;
use App\Enums\ReminderJobType;
use App\Mail\DocumentReminderMail;
use App\Models\Contact;
use App\Models\Document;
use App\Models\ReminderJob;
use App\Models\Team;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

test('a reminder is generated for an invoice due within 3 days', function () {
    Mail::fake();

    $team = Team::factory()->create();
    $contact = Contact::factory()->for($team)->create();
    $invoice = Document::factory()->for($team)->for($contact)->state([
        'type' => DocumentType::Invoice,
        'status' => DocumentStatus::Sent,
        'due_at' => now()->addDays(2),
    ])->create();

    $this->artisan('reminders:generate')->assertSuccessful();

    $reminder = ReminderJob::where('document_id', $invoice->id)->sole();
    expect($reminder->type)->toBe(ReminderJobType::InvoiceDueSoon);
    expect($reminder->sent_at)->not->toBeNull();

    Mail::assertSent(DocumentReminderMail::class, 1);
});

test('a reminder is generated for an overdue invoice', function () {
    Mail::fake();

    $team = Team::factory()->create();
    $contact = Contact::factory()->for($team)->create();
    $invoice = Document::factory()->for($team)->for($contact)->state([
        'type' => DocumentType::Invoice,
        'status' => DocumentStatus::Viewed,
        'due_at' => now()->subDays(2),
    ])->create();

    $this->artisan('reminders:generate')->assertSuccessful();

    $reminder = ReminderJob::where('document_id', $invoice->id)->sole();
    expect($reminder->type)->toBe(ReminderJobType::InvoiceOverdue);
});

test('no reminder is generated for an invoice not yet close to its due date', function () {
    $team = Team::factory()->create();
    $contact = Contact::factory()->for($team)->create();
    Document::factory()->for($team)->for($contact)->state([
        'type' => DocumentType::Invoice,
        'status' => DocumentStatus::Sent,
        'due_at' => now()->addDays(10),
    ])->create();

    $this->artisan('reminders:generate')->assertSuccessful();

    expect(ReminderJob::count())->toBe(0);
});

test('a reminder is generated for a quote that expired without a response', function () {
    Mail::fake();

    $team = Team::factory()->create();
    $contact = Contact::factory()->for($team)->create();
    $quote = Document::factory()->for($team)->for($contact)->state([
        'type' => DocumentType::Quote,
        'status' => DocumentStatus::Sent,
        'valid_until' => now()->subDays(1),
    ])->create();

    $this->artisan('reminders:generate')->assertSuccessful();

    $reminder = ReminderJob::where('document_id', $quote->id)->sole();
    expect($reminder->type)->toBe(ReminderJobType::QuoteUnresponded);
});

test('no reminder is generated for a quote that is still within its validity window', function () {
    $team = Team::factory()->create();
    $contact = Contact::factory()->for($team)->create();
    Document::factory()->for($team)->for($contact)->state([
        'type' => DocumentType::Quote,
        'status' => DocumentStatus::Sent,
        'valid_until' => now()->addDays(5),
    ])->create();

    $this->artisan('reminders:generate')->assertSuccessful();

    expect(ReminderJob::count())->toBe(0);
});

test('running the command twice does not create duplicate reminders or resend emails', function () {
    Mail::fake();

    $team = Team::factory()->create();
    $contact = Contact::factory()->for($team)->create();
    Document::factory()->for($team)->for($contact)->state([
        'type' => DocumentType::Invoice,
        'status' => DocumentStatus::Sent,
        'due_at' => now()->subDays(1),
    ])->create();

    $this->artisan('reminders:generate')->assertSuccessful();
    $this->artisan('reminders:generate')->assertSuccessful();

    expect(ReminderJob::count())->toBe(1);
    Mail::assertSent(DocumentReminderMail::class, 1);
});

test('a document without a contact does not crash reminder generation and sends no email', function () {
    Mail::fake();

    $team = Team::factory()->create();
    $invoice = Document::factory()->for($team)->state([
        'type' => DocumentType::Invoice,
        'status' => DocumentStatus::Sent,
        'due_at' => now()->subDays(1),
        'contact_id' => null,
    ])->create();

    $this->artisan('reminders:generate')->assertSuccessful();

    $reminder = ReminderJob::where('document_id', $invoice->id)->sole();
    expect($reminder->sent_at)->toBeNull();
    Mail::assertNothingSent();
});

test('a reminder can be dismissed and undismissed', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create();
    $invoice = Document::factory()->for($team)->for($contact)->state(['type' => DocumentType::Invoice])->create();
    $reminder = ReminderJob::factory()->for($invoice)->create(['dismissed_at' => null]);

    $this->actingAs($user)
        ->patch(route('reminders.dismiss', ['current_team' => $team->slug, 'reminder' => $reminder->id]))
        ->assertRedirect();

    expect($reminder->fresh()->dismissed_at)->not->toBeNull();

    $this->actingAs($user)
        ->patch(route('reminders.dismiss', ['current_team' => $team->slug, 'reminder' => $reminder->id]))
        ->assertRedirect();

    expect($reminder->fresh()->dismissed_at)->toBeNull();
});

test('a team cannot dismiss another team\'s reminder', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $otherTeam = Team::factory()->create();
    $foreignContact = Contact::factory()->for($otherTeam)->create();
    $invoice = Document::factory()->for($otherTeam)->for($foreignContact)->state(['type' => DocumentType::Invoice])->create();
    $reminder = ReminderJob::factory()->for($invoice)->create(['dismissed_at' => null]);

    $this->actingAs($user)
        ->patch(route('reminders.dismiss', ['current_team' => $team->slug, 'reminder' => $reminder->id]))
        ->assertNotFound();

    expect($reminder->fresh()->dismissed_at)->toBeNull();
});

<?php

use App\Enums\DocumentStatus;
use App\Enums\DocumentType;
use App\Mail\RecurringInvoiceGeneratedMail;
use App\Models\Contact;
use App\Models\Document;
use App\Models\Project;
use App\Models\RecurringInvoiceTemplate;
use App\Models\RecurringInvoiceTemplateItem;
use App\Models\Team;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

test('an invoice is generated for a template whose next run date has arrived', function () {
    $team = Team::factory()->create();
    $contact = Contact::factory()->for($team)->create();
    $template = RecurringInvoiceTemplate::factory()->for($team)->for($contact)->create([
        'next_run_at' => now()->subDay(),
        'is_active' => true,
    ]);
    RecurringInvoiceTemplateItem::factory()->for($template, 'template')->create([
        'name' => 'Retainer',
        'quantity' => 1,
        'unit_price_value' => 1000,
    ]);

    $this->artisan('invoices:generate-recurring')->assertSuccessful();

    $invoice = Document::where('recurring_invoice_template_id', $template->id)->sole();
    expect($invoice->type)->toBe(DocumentType::Invoice);
    expect($invoice->contact_id)->toBe($contact->id);
});

test('no invoice is generated for a template whose next run date is in the future', function () {
    $team = Team::factory()->create();
    $contact = Contact::factory()->for($team)->create();
    RecurringInvoiceTemplate::factory()->for($team)->for($contact)->create([
        'next_run_at' => now()->addDays(5),
        'is_active' => true,
    ]);

    $this->artisan('invoices:generate-recurring')->assertSuccessful();

    expect(Document::count())->toBe(0);
});

test('no invoice is generated for a paused template', function () {
    $team = Team::factory()->create();
    $contact = Contact::factory()->for($team)->create();
    RecurringInvoiceTemplate::factory()->for($team)->for($contact)->create([
        'next_run_at' => now()->subDay(),
        'is_active' => false,
    ]);

    $this->artisan('invoices:generate-recurring')->assertSuccessful();

    expect(Document::count())->toBe(0);
});

test('running the command twice on the same day does not double-generate an invoice', function () {
    $team = Team::factory()->create();
    $contact = Contact::factory()->for($team)->create();
    RecurringInvoiceTemplate::factory()->for($team)->for($contact)->create([
        'interval_months' => 1,
        'starts_at' => now()->subDay()->toDateString(),
        'next_run_at' => now()->subDay(),
        'is_active' => true,
    ]);

    $this->artisan('invoices:generate-recurring')->assertSuccessful();
    $this->artisan('invoices:generate-recurring')->assertSuccessful();

    expect(Document::count())->toBe(1);
});

test('the next run date is re-anchored from starts_at across a month-end, not chained from the previous run', function () {
    $team = Team::factory()->create();
    $contact = Contact::factory()->for($team)->create();
    $template = RecurringInvoiceTemplate::factory()->for($team)->for($contact)->create([
        'interval_months' => 1,
        'starts_at' => '2026-01-31',
        'next_run_at' => '2026-01-31',
        'ends_at' => null,
        'is_active' => true,
    ]);

    $this->travelTo('2026-01-31');
    $this->artisan('invoices:generate-recurring')->assertSuccessful();
    expect($template->fresh()->next_run_at->toDateString())->toBe('2026-02-28');

    $this->travelTo('2026-02-28');
    $this->artisan('invoices:generate-recurring')->assertSuccessful();
    expect($template->fresh()->next_run_at->toDateString())->toBe('2026-03-31');

    $this->travelBack();

    expect(Document::where('recurring_invoice_template_id', $template->id)->count())->toBe(2);
});

test('a template is deactivated once its next run date would pass the end date', function () {
    $team = Team::factory()->create();
    $contact = Contact::factory()->for($team)->create();
    $template = RecurringInvoiceTemplate::factory()->for($team)->for($contact)->create([
        'interval_months' => 1,
        'starts_at' => now()->subDay()->toDateString(),
        'next_run_at' => now()->subDay(),
        'ends_at' => now()->toDateString(),
        'is_active' => true,
    ]);

    $this->artisan('invoices:generate-recurring')->assertSuccessful();

    expect($template->fresh()->is_active)->toBeFalse();
});

test('auto_send generates a sent invoice and emails the client', function () {
    Mail::fake();

    $team = Team::factory()->create();
    $contact = Contact::factory()->for($team)->create();
    RecurringInvoiceTemplate::factory()->for($team)->for($contact)->create([
        'next_run_at' => now()->subDay(),
        'is_active' => true,
        'auto_send' => true,
    ]);

    $this->artisan('invoices:generate-recurring')->assertSuccessful();

    $invoice = Document::sole();
    expect($invoice->status)->toBe(DocumentStatus::Sent);
    Mail::assertSent(RecurringInvoiceGeneratedMail::class, 1);
});

test('disabling auto_send generates a draft invoice and sends no email', function () {
    Mail::fake();

    $team = Team::factory()->create();
    $contact = Contact::factory()->for($team)->create();
    RecurringInvoiceTemplate::factory()->for($team)->for($contact)->create([
        'next_run_at' => now()->subDay(),
        'is_active' => true,
        'auto_send' => false,
    ]);

    $this->artisan('invoices:generate-recurring')->assertSuccessful();

    $invoice = Document::sole();
    expect($invoice->status)->toBe(DocumentStatus::Draft);
    Mail::assertNothingSent();
});

test('the generated invoice inherits the template\'s project, currency, tax, notes, and line items', function () {
    $team = Team::factory()->create();
    $contact = Contact::factory()->for($team)->create();
    $project = Project::factory()->for($team)->create();
    $template = RecurringInvoiceTemplate::factory()->for($team)->for($contact)->create([
        'project_id' => $project->id,
        'currency' => 'IDR',
        'tax_percent' => 11,
        'notes' => 'Pay via bank transfer',
        'next_run_at' => now()->subDay(),
        'is_active' => true,
    ]);
    RecurringInvoiceTemplateItem::factory()->for($template, 'template')->create([
        'name' => 'Design work',
        'quantity' => 2,
        'unit_price_value' => 500,
    ]);

    $this->artisan('invoices:generate-recurring')->assertSuccessful();

    $invoice = Document::sole();
    expect($invoice->project_id)->toBe($project->id);
    expect($invoice->currency)->toBe('IDR');
    expect($invoice->tax_percent)->toBe(11);
    expect($invoice->notes)->toBe('Pay via bank transfer');
    expect($invoice->subtotalValue())->toBe(1000);
});

test('a template whose contact was deleted is skipped and auto-paused without crashing', function () {
    Mail::fake();

    $team = Team::factory()->create();
    $template = RecurringInvoiceTemplate::factory()->for($team)->create([
        'contact_id' => null,
        'next_run_at' => now()->subDay(),
        'is_active' => true,
    ]);

    $this->artisan('invoices:generate-recurring')->assertSuccessful();

    expect(Document::count())->toBe(0);
    expect($template->fresh()->is_active)->toBeFalse();
    Mail::assertNothingSent();
});

test('the generated invoice supports manual payment recording like any other invoice', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $contact = Contact::factory()->for($team)->create();
    RecurringInvoiceTemplate::factory()->for($team)->for($contact)->create([
        'next_run_at' => now()->subDay(),
        'is_active' => true,
        'auto_send' => true,
    ]);

    $this->artisan('invoices:generate-recurring')->assertSuccessful();

    $invoice = Document::sole();

    $this->actingAs($user)
        ->post(route('invoices.payments.store', ['current_team' => $team->slug, 'invoice' => $invoice->id]), [
            'method' => 'Bank Transfer',
            'amountValue' => 500,
            'paidAt' => now()->toDateString(),
        ])
        ->assertRedirect();

    expect($invoice->fresh()->amountPaidValue())->toBe(500);
});

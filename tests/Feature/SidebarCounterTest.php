<?php

use App\Enums\DocumentType;
use App\Enums\ReminderJobType;
use App\Models\BookingLink;
use App\Models\Contact;
use App\Models\Document;
use App\Models\Opportunity;
use App\Models\ProfileAsset;
use App\Models\Project;
use App\Models\ReminderJob;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('app sidebar counters reflect the current team data', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $otherTeam = User::factory()->create()->currentTeam;

    $contact = Contact::factory()->for($team)->create();
    Contact::factory()->for($team)->count(2)->create();
    Contact::factory()->for($otherTeam)->count(4)->create();

    $opportunities = Opportunity::factory()->for($team)->for($contact)->count(3)->create();
    Opportunity::factory()->for($otherTeam)->for(Contact::factory()->for($otherTeam))->count(2)->create();

    Project::factory()->for($team)->for($opportunities[0])->create();
    Project::factory()->for($team)->for($opportunities[1])->create();
    Project::factory()->for($otherTeam)->for(Opportunity::factory()->for($otherTeam))->create();

    Document::factory()->for($team)->for($contact)->state(['type' => DocumentType::Proposal])->count(2)->create();
    Document::factory()->for($team)->for($contact)->state(['type' => DocumentType::Quote])->count(3)->create();
    $invoices = Document::factory()->for($team)->for($contact)->state(['type' => DocumentType::Invoice])->count(4)->create();
    Document::factory()->for($otherTeam)->for(Contact::factory()->for($otherTeam))->state(['type' => DocumentType::Invoice])->count(5)->create();

    ReminderJob::factory()->for($invoices[0])->count(2)->sequence(
        ['type' => ReminderJobType::InvoiceDueSoon],
        ['type' => ReminderJobType::InvoiceOverdue],
    )->create();
    ReminderJob::factory()->for($invoices[1])->count(2)->sequence(
        ['type' => ReminderJobType::InvoiceDueSoon],
        ['type' => ReminderJobType::InvoiceOverdue],
    )->create();
    ReminderJob::factory()->for($invoices[2])->state(['type' => ReminderJobType::InvoiceDueSoon])->create();

    ProfileAsset::factory()->for($team)->count(6)->create();
    ProfileAsset::factory()->for($otherTeam)->count(7)->create();

    BookingLink::factory()->for($team)->count(2)->create();
    BookingLink::factory()->for($otherTeam)->count(3)->create();

    $this->actingAs($user)
        ->get(route('dashboard', ['current_team' => $team->slug]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('sidebarCounts.opportunities', 3)
            ->where('sidebarCounts.projects', 2)
            ->where('sidebarCounts.proposals', 2)
            ->where('sidebarCounts.quotations', 3)
            ->where('sidebarCounts.invoices', 4)
            ->where('sidebarCounts.contacts', 3)
            ->where('sidebarCounts.reminders', 5)
            ->where('sidebarCounts.bookingLinks', 2)
            ->where('sidebarCounts.profileLibrary', 6),
        );
});

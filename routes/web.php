<?php

use App\Http\Controllers\ContactController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InvoiceCreateController;
use App\Http\Controllers\InvoicesController;
use App\Http\Controllers\InvoiceShowController;
use App\Http\Controllers\LandingPageController;
use App\Http\Controllers\OpportunitiesController;
use App\Http\Controllers\OpportunityCreateController;
use App\Http\Controllers\OpportunityEditController;
use App\Http\Controllers\ProfileLibraryController;
use App\Http\Controllers\ProjectCreateController;
use App\Http\Controllers\ProjectEditController;
use App\Http\Controllers\ProjectsController;
use App\Http\Controllers\ProjectShowController;
use App\Http\Controllers\ProposalCreateController;
use App\Http\Controllers\ProposalEditController;
use App\Http\Controllers\ProposalsController;
use App\Http\Controllers\ProposalShowController;
use App\Http\Controllers\PublicDocumentController;
use App\Http\Controllers\PublicLeadFormController;
use App\Http\Controllers\QuotationCreateController;
use App\Http\Controllers\QuotationsController;
use App\Http\Controllers\QuotationShowController;
use App\Http\Controllers\RemindersController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Middleware\EnsureTeamMembership;
use Illuminate\Support\Facades\Route;

Route::get('/', LandingPageController::class)->name('home');
Route::get('/p/{team:slug}', PublicLeadFormController::class)->name('public-lead-form');
Route::get('/d/{team:slug}/{document}', PublicDocumentController::class)->name('public-document');

Route::prefix('app/{current_team}')
    ->middleware(['auth', 'verified', EnsureTeamMembership::class])
    ->group(function () {
        Route::get('dashboard', DashboardController::class)->name('dashboard');
        Route::get('opportunities', OpportunitiesController::class)->name('opportunities.index');
        Route::get('opportunities/create', OpportunityCreateController::class)->name('opportunities.create');
        Route::get('opportunities/{opportunity}/edit', OpportunityEditController::class)
            ->whereNumber('opportunity')
            ->name('opportunities.edit');
        Route::get('projects', ProjectsController::class)->name('projects.index');
        Route::get('projects/create', ProjectCreateController::class)->name('projects.create');
        Route::get('projects/{project}', ProjectShowController::class)
            ->whereNumber('project')
            ->name('projects.show');
        Route::get('projects/{project}/edit', ProjectEditController::class)
            ->whereNumber('project')
            ->name('projects.edit');
        Route::controller(ContactController::class)->group(function () {
            Route::get('contacts', 'index')->name('contacts.index');
            Route::get('contacts/create', 'create')->name('contacts.create');
            Route::get('contacts/{contact}', 'show')
                ->whereNumber('contact')
                ->name('contacts.show');
            Route::get('contacts/{contact}/edit', 'edit')
                ->whereNumber('contact')
                ->name('contacts.edit');
        });
        Route::get('proposals', ProposalsController::class)->name('proposals.index');
        Route::get('proposals/create', ProposalCreateController::class)->name('proposals.create');
        Route::get('proposals/{proposal}/edit', ProposalEditController::class)
            ->whereNumber('proposal')
            ->name('proposals.edit');
        Route::get('proposals/{proposal}', ProposalShowController::class)
            ->whereNumber('proposal')
            ->name('proposals.show');
        Route::get('invoices', InvoicesController::class)->name('invoices.index');
        Route::get('invoices/create', InvoiceCreateController::class)->name('invoices.create');
        Route::get('invoices/{invoice}', InvoiceShowController::class)
            ->whereNumber('invoice')
            ->name('invoices.show');
        Route::get('quotations', QuotationsController::class)->name('quotations.index');
        Route::get('quotations/create', QuotationCreateController::class)->name('quotations.create');
        Route::get('quotations/{quotation}', QuotationShowController::class)
            ->whereNumber('quotation')
            ->name('quotations.show');
        Route::get('reminders', RemindersController::class)->name('reminders.index');
        Route::controller(ProfileLibraryController::class)->group(function () {
            Route::get('profiles', 'index')->name('profiles.index');
            Route::get('profiles/create', 'create')->name('profiles.create');
            Route::get('profiles/{profile}/edit', 'edit')
                ->whereNumber('profile')
                ->name('profiles.edit');
        });
    });

Route::middleware(['auth'])->group(function () {
    Route::get('invitations/{invitation}/accept', [TeamInvitationController::class, 'accept'])->name('invitations.accept');
    Route::delete('invitations/{invitation}', [TeamInvitationController::class, 'decline'])->name('invitations.decline');
});

require __DIR__.'/settings.php';

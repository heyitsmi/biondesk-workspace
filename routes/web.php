<?php

use App\Http\Controllers\ContactController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InvoiceCreateController;
use App\Http\Controllers\InvoicesController;
use App\Http\Controllers\InvoiceShowController;
use App\Http\Controllers\InvoiceStoreController;
use App\Http\Controllers\LandingPageController;
use App\Http\Controllers\OpportunitiesController;
use App\Http\Controllers\OpportunityCreateController;
use App\Http\Controllers\OpportunityDestroyController;
use App\Http\Controllers\OpportunityEditController;
use App\Http\Controllers\OpportunityMoveStageController;
use App\Http\Controllers\OpportunityStoreController;
use App\Http\Controllers\OpportunityUpdateController;
use App\Http\Controllers\ProfileLibraryController;
use App\Http\Controllers\ProjectCreateController;
use App\Http\Controllers\ProjectDestroyController;
use App\Http\Controllers\ProjectEditController;
use App\Http\Controllers\ProjectMoveController;
use App\Http\Controllers\ProjectsController;
use App\Http\Controllers\ProjectShowController;
use App\Http\Controllers\ProjectStoreController;
use App\Http\Controllers\ProjectUpdateController;
use App\Http\Controllers\ProposalAiDraftController;
use App\Http\Controllers\ProposalConvertToInvoiceController;
use App\Http\Controllers\ProposalConvertToQuoteController;
use App\Http\Controllers\ProposalCreateController;
use App\Http\Controllers\ProposalDestroyController;
use App\Http\Controllers\ProposalEditController;
use App\Http\Controllers\ProposalMoveController;
use App\Http\Controllers\ProposalsController;
use App\Http\Controllers\ProposalShowController;
use App\Http\Controllers\ProposalStoreController;
use App\Http\Controllers\ProposalUpdateController;
use App\Http\Controllers\PublicDocumentController;
use App\Http\Controllers\PublicLeadFormController;
use App\Http\Controllers\PublicLeadFormSubmitController;
use App\Http\Controllers\QuotationConvertToInvoiceController;
use App\Http\Controllers\QuotationCreateController;
use App\Http\Controllers\QuotationMoveController;
use App\Http\Controllers\QuotationsController;
use App\Http\Controllers\QuotationShowController;
use App\Http\Controllers\QuotationStoreController;
use App\Http\Controllers\RemindersController;
use App\Http\Controllers\RequestLogConvertToTaskController;
use App\Http\Controllers\RequestLogDestroyController;
use App\Http\Controllers\RequestLogStoreController;
use App\Http\Controllers\RequestLogUpdateController;
use App\Http\Controllers\TaskDestroyController;
use App\Http\Controllers\TaskMoveController;
use App\Http\Controllers\TaskStoreController;
use App\Http\Controllers\TaskUpdateController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Middleware\EnsureTeamMembership;
use Illuminate\Support\Facades\Route;

Route::get('/', LandingPageController::class)->name('home');
Route::get('/p/{team:slug}', PublicLeadFormController::class)->name('public-lead-form');
Route::post('/p/{team:slug}', PublicLeadFormSubmitController::class)->name('public-lead-form.submit');
Route::get('/d/{team:slug}/{document}', PublicDocumentController::class)->name('public-document');

Route::prefix('app/{current_team}')
    ->middleware(['auth', 'verified', EnsureTeamMembership::class])
    ->group(function () {
        Route::get('dashboard', DashboardController::class)->name('dashboard');
        Route::get('opportunities', OpportunitiesController::class)->name('opportunities.index');
        Route::get('opportunities/create', OpportunityCreateController::class)->name('opportunities.create');
        Route::post('opportunities', OpportunityStoreController::class)->name('opportunities.store');
        Route::get('opportunities/{opportunity}/edit', OpportunityEditController::class)
            ->whereNumber('opportunity')
            ->name('opportunities.edit');
        Route::put('opportunities/{opportunity}', OpportunityUpdateController::class)
            ->whereNumber('opportunity')
            ->name('opportunities.update');
        Route::patch('opportunities/{opportunity}/stage', OpportunityMoveStageController::class)
            ->whereNumber('opportunity')
            ->name('opportunities.move-stage');
        Route::delete('opportunities/{opportunity}', OpportunityDestroyController::class)
            ->whereNumber('opportunity')
            ->name('opportunities.destroy');
        Route::get('projects', ProjectsController::class)->name('projects.index');
        Route::get('projects/create', ProjectCreateController::class)->name('projects.create');
        Route::post('projects', ProjectStoreController::class)->name('projects.store');
        Route::get('projects/{project}', ProjectShowController::class)
            ->whereNumber('project')
            ->name('projects.show');
        Route::get('projects/{project}/edit', ProjectEditController::class)
            ->whereNumber('project')
            ->name('projects.edit');
        Route::put('projects/{project}', ProjectUpdateController::class)
            ->whereNumber('project')
            ->name('projects.update');
        Route::patch('projects/{project}/move', ProjectMoveController::class)
            ->whereNumber('project')
            ->name('projects.move');
        Route::delete('projects/{project}', ProjectDestroyController::class)
            ->whereNumber('project')
            ->name('projects.destroy');
        Route::post('projects/{project}/tasks', TaskStoreController::class)
            ->whereNumber('project')
            ->name('projects.tasks.store');
        Route::put('projects/{project}/tasks/{task}', TaskUpdateController::class)
            ->whereNumber(['project', 'task'])
            ->name('projects.tasks.update');
        Route::patch('projects/{project}/tasks/{task}/move', TaskMoveController::class)
            ->whereNumber(['project', 'task'])
            ->name('projects.tasks.move');
        Route::delete('projects/{project}/tasks/{task}', TaskDestroyController::class)
            ->whereNumber(['project', 'task'])
            ->name('projects.tasks.destroy');
        Route::post('projects/{project}/request-logs', RequestLogStoreController::class)
            ->whereNumber('project')
            ->name('projects.request-logs.store');
        Route::put('projects/{project}/request-logs/{requestLog}', RequestLogUpdateController::class)
            ->whereNumber(['project', 'requestLog'])
            ->name('projects.request-logs.update');
        Route::delete('projects/{project}/request-logs/{requestLog}', RequestLogDestroyController::class)
            ->whereNumber(['project', 'requestLog'])
            ->name('projects.request-logs.destroy');
        Route::post('projects/{project}/request-logs/{requestLog}/convert-to-task', RequestLogConvertToTaskController::class)
            ->whereNumber(['project', 'requestLog'])
            ->name('projects.request-logs.convert-to-task');
        Route::controller(ContactController::class)->group(function () {
            Route::get('contacts', 'index')->name('contacts.index');
            Route::get('contacts/create', 'create')->name('contacts.create');
            Route::post('contacts', 'store')->name('contacts.store');
            Route::get('contacts/{contact}', 'show')
                ->whereNumber('contact')
                ->name('contacts.show');
            Route::get('contacts/{contact}/edit', 'edit')
                ->whereNumber('contact')
                ->name('contacts.edit');
            Route::put('contacts/{contact}', 'update')
                ->whereNumber('contact')
                ->name('contacts.update');
            Route::delete('contacts/{contact}', 'destroy')
                ->whereNumber('contact')
                ->name('contacts.destroy');
        });
        Route::get('proposals', ProposalsController::class)->name('proposals.index');
        Route::get('proposals/create', ProposalCreateController::class)->name('proposals.create');
        Route::post('proposals/ai-draft', ProposalAiDraftController::class)->name('proposals.ai-draft');
        Route::post('proposals', ProposalStoreController::class)->name('proposals.store');
        Route::get('proposals/{proposal}/edit', ProposalEditController::class)
            ->whereNumber('proposal')
            ->name('proposals.edit');
        Route::put('proposals/{proposal}', ProposalUpdateController::class)
            ->whereNumber('proposal')
            ->name('proposals.update');
        Route::delete('proposals/{proposal}', ProposalDestroyController::class)
            ->whereNumber('proposal')
            ->name('proposals.destroy');
        Route::patch('proposals/{proposal}/status', ProposalMoveController::class)
            ->whereNumber('proposal')
            ->name('proposals.move');
        Route::post('proposals/{proposal}/convert-to-quote', ProposalConvertToQuoteController::class)
            ->whereNumber('proposal')
            ->name('proposals.convert-to-quote');
        Route::post('proposals/{proposal}/convert-to-invoice', ProposalConvertToInvoiceController::class)
            ->whereNumber('proposal')
            ->name('proposals.convert-to-invoice');
        Route::get('proposals/{proposal}', ProposalShowController::class)
            ->whereNumber('proposal')
            ->name('proposals.show');
        Route::get('invoices', InvoicesController::class)->name('invoices.index');
        Route::get('invoices/create', InvoiceCreateController::class)->name('invoices.create');
        Route::post('invoices', InvoiceStoreController::class)->name('invoices.store');
        Route::get('invoices/{invoice}', InvoiceShowController::class)
            ->whereNumber('invoice')
            ->name('invoices.show');
        Route::get('quotations', QuotationsController::class)->name('quotations.index');
        Route::get('quotations/create', QuotationCreateController::class)->name('quotations.create');
        Route::post('quotations', QuotationStoreController::class)->name('quotations.store');
        Route::patch('quotations/{quotation}/status', QuotationMoveController::class)
            ->whereNumber('quotation')
            ->name('quotations.move');
        Route::post('quotations/{quotation}/convert-to-invoice', QuotationConvertToInvoiceController::class)
            ->whereNumber('quotation')
            ->name('quotations.convert-to-invoice');
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

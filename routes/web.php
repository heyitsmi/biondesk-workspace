<?php

use App\Http\Controllers\BionAiConversationDestroyController;
use App\Http\Controllers\BionAiConversationIndexController;
use App\Http\Controllers\BionAiConversationRenameController;
use App\Http\Controllers\BionAiConversationStoreController;
use App\Http\Controllers\BionAiMessageStatusController;
use App\Http\Controllers\BionAiMessageStoreController;
use App\Http\Controllers\BlogIndexController;
use App\Http\Controllers\BlogShowController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\ClientPortalController;
use App\Http\Controllers\ClientPortalRequestLogShowController;
use App\Http\Controllers\ClientPortalRequestMessageStoreController;
use App\Http\Controllers\ClientPortalRequestStoreController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocumentPdfDownloadController;
use App\Http\Controllers\DocumentPdfGenerateController;
use App\Http\Controllers\DocumentPdfStatusController;
use App\Http\Controllers\DocumentPrintController;
use App\Http\Controllers\EventDestroyController;
use App\Http\Controllers\EventMoveController;
use App\Http\Controllers\EventStoreController;
use App\Http\Controllers\EventUpdateController;
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
use App\Http\Controllers\PaymentStoreController;
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
use App\Http\Controllers\RecurringInvoiceCreateController;
use App\Http\Controllers\RecurringInvoiceEditController;
use App\Http\Controllers\RecurringInvoiceMoveController;
use App\Http\Controllers\RecurringInvoiceShowController;
use App\Http\Controllers\RecurringInvoiceStoreController;
use App\Http\Controllers\RecurringInvoiceUpdateController;
use App\Http\Controllers\ReminderDismissController;
use App\Http\Controllers\RemindersController;
use App\Http\Controllers\RequestLogConvertToTaskController;
use App\Http\Controllers\RequestLogDestroyController;
use App\Http\Controllers\RequestLogMessageStoreController;
use App\Http\Controllers\RequestLogShowController;
use App\Http\Controllers\RequestLogStatusUpdateController;
use App\Http\Controllers\RequestLogStoreController;
use App\Http\Controllers\RequestLogUpdateController;
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\TaskDestroyController;
use App\Http\Controllers\TaskMoveController;
use App\Http\Controllers\TaskStoreController;
use App\Http\Controllers\TaskUpdateController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Middleware\EnsureTeamMembership;
use Illuminate\Support\Facades\Route;

Route::get('/', LandingPageController::class)->name('home');
Route::get('/sitemap.xml', SitemapController::class)->name('sitemap.xml');
Route::get('/sitemap', SitemapController::class)->name('sitemap');
Route::get('/p/{team}', PublicLeadFormController::class)->name('public-lead-form');
Route::post('/p/{team}', PublicLeadFormSubmitController::class)->name('public-lead-form.submit');
Route::get('/d/{document:public_token}', PublicDocumentController::class)->name('public-document');
Route::get('/d/{document:public_token}/print', DocumentPrintController::class)->name('documents.print');
Route::post('/d/{document:public_token}/pdf', DocumentPdfGenerateController::class)->name('documents.pdf.generate');
Route::get('/d/{document:public_token}/pdf/status', DocumentPdfStatusController::class)->name('documents.pdf.status');
Route::get('/d/{document:public_token}/pdf/download', DocumentPdfDownloadController::class)->name('documents.pdf.download');
Route::get('/c/{contact:portal_token}', ClientPortalController::class)->name('client-portal.show');
Route::post('/c/{contact:portal_token}/projects/{project}/requests', ClientPortalRequestStoreController::class)
    ->whereNumber('project')
    ->name('client-portal.requests.store');
Route::get('/c/{contact:portal_token}/projects/{project}/requests/{requestLog}', ClientPortalRequestLogShowController::class)
    ->whereNumber('project')
    ->whereUuid('requestLog')
    ->name('client-portal.requests.show');
Route::post('/c/{contact:portal_token}/projects/{project}/requests/{requestLog}/messages', ClientPortalRequestMessageStoreController::class)
    ->whereNumber(['project', 'requestLog'])
    ->name('client-portal.request-messages.store');

Route::get('/blog', BlogIndexController::class)->name('blog.index');
Route::get('/blog/{slug}', BlogShowController::class)->name('blog.show');

Route::prefix('app/{current_team}')
    ->middleware(['auth', 'verified', EnsureTeamMembership::class])
    ->group(function () {
        Route::get('dashboard', DashboardController::class)->name('dashboard');
        Route::get('bion-ai', BionAiConversationIndexController::class)->name('bion-ai.index');
        Route::get('bion-ai/{conversation}', BionAiConversationIndexController::class)
            ->whereNumber('conversation')
            ->name('bion-ai.show');
        Route::post('bion-ai/conversations', BionAiConversationStoreController::class)->name('bion-ai.conversations.store');
        Route::patch('bion-ai/conversations/{conversation}', BionAiConversationRenameController::class)
            ->whereNumber('conversation')
            ->name('bion-ai.conversations.update');
        Route::delete('bion-ai/conversations/{conversation}', BionAiConversationDestroyController::class)
            ->whereNumber('conversation')
            ->name('bion-ai.conversations.destroy');
        Route::post('bion-ai/conversations/{conversation}/messages', BionAiMessageStoreController::class)
            ->whereNumber('conversation')
            ->name('bion-ai.messages.store');
        Route::get('bion-ai/conversations/{conversation}/messages/status', BionAiMessageStatusController::class)
            ->whereNumber('conversation')
            ->name('bion-ai.messages.status');
        Route::get('calendar', CalendarController::class)->name('calendar.index');
        Route::post('calendar/events', EventStoreController::class)->name('calendar.events.store');
        Route::put('calendar/events/{event}', EventUpdateController::class)
            ->whereNumber('event')
            ->name('calendar.events.update');
        Route::patch('calendar/events/{event}/move', EventMoveController::class)
            ->whereNumber('event')
            ->name('calendar.events.move');
        Route::delete('calendar/events/{event}', EventDestroyController::class)
            ->whereNumber('event')
            ->name('calendar.events.destroy');
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
        Route::get('projects/{project}/request-logs/{requestLog}', RequestLogShowController::class)
            ->whereNumber('project')
            ->whereUuid('requestLog')
            ->name('projects.request-logs.show');
        Route::put('projects/{project}/request-logs/{requestLog}', RequestLogUpdateController::class)
            ->whereNumber(['project', 'requestLog'])
            ->name('projects.request-logs.update');
        Route::patch('projects/{project}/request-logs/{requestLog}/status', RequestLogStatusUpdateController::class)
            ->whereNumber(['project', 'requestLog'])
            ->name('projects.request-logs.status.update');
        Route::post('projects/{project}/request-logs/{requestLog}/messages', RequestLogMessageStoreController::class)
            ->whereNumber(['project', 'requestLog'])
            ->name('projects.request-logs.messages.store');
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
        Route::post('invoices/{invoice}/payments', PaymentStoreController::class)
            ->whereNumber('invoice')
            ->name('invoices.payments.store');
        Route::get('invoices/{invoice}', InvoiceShowController::class)
            ->whereNumber('invoice')
            ->name('invoices.show');
        Route::get('invoices/recurring/create', RecurringInvoiceCreateController::class)
            ->name('invoices.recurring.create');
        Route::post('invoices/recurring', RecurringInvoiceStoreController::class)
            ->name('invoices.recurring.store');
        Route::get('invoices/recurring/{template}', RecurringInvoiceShowController::class)
            ->whereNumber('template')
            ->name('invoices.recurring.show');
        Route::get('invoices/recurring/{template}/edit', RecurringInvoiceEditController::class)
            ->whereNumber('template')
            ->name('invoices.recurring.edit');
        Route::put('invoices/recurring/{template}', RecurringInvoiceUpdateController::class)
            ->whereNumber('template')
            ->name('invoices.recurring.update');
        Route::patch('invoices/recurring/{template}/status', RecurringInvoiceMoveController::class)
            ->whereNumber('template')
            ->name('invoices.recurring.move');
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
        Route::patch('reminders/{reminder}/dismiss', ReminderDismissController::class)
            ->whereNumber('reminder')
            ->name('reminders.dismiss');
        Route::controller(ProfileLibraryController::class)->group(function () {
            Route::get('profiles', 'index')->name('profiles.index');
            Route::get('profiles/create', 'create')->name('profiles.create');
            Route::post('profiles', 'store')->name('profiles.store');
            Route::get('profiles/{profile}/edit', 'edit')
                ->whereNumber('profile')
                ->name('profiles.edit');
            Route::put('profiles/{profile}', 'update')
                ->whereNumber('profile')
                ->name('profiles.update');
            Route::delete('profiles/{profile}', 'destroy')
                ->whereNumber('profile')
                ->name('profiles.destroy');
            Route::post('profiles/{profile}/duplicate', 'duplicate')
                ->whereNumber('profile')
                ->name('profiles.duplicate');
        });
    });

Route::middleware(['auth'])->group(function () {
    Route::get('invitations/{invitation}/accept', [TeamInvitationController::class, 'accept'])->name('invitations.accept');
    Route::delete('invitations/{invitation}', [TeamInvitationController::class, 'decline'])->name('invitations.decline');
});

require __DIR__.'/settings.php';
require __DIR__.'/ops.php';

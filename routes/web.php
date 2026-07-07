<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InvoiceCreateController;
use App\Http\Controllers\InvoicesController;
use App\Http\Controllers\InvoiceShowController;
use App\Http\Controllers\LandingPageController;
use App\Http\Controllers\OpportunitiesController;
use App\Http\Controllers\ProjectsController;
use App\Http\Controllers\ProjectShowController;
use App\Http\Controllers\ProposalsController;
use App\Http\Controllers\PublicLeadFormController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Middleware\EnsureTeamMembership;
use Illuminate\Support\Facades\Route;

Route::get('/', LandingPageController::class)->name('home');
Route::get('/p/{team:slug}', PublicLeadFormController::class)->name('public-lead-form');

Route::prefix('app/{current_team}')
    ->middleware(['auth', 'verified', EnsureTeamMembership::class])
    ->group(function () {
        Route::get('dashboard', DashboardController::class)->name('dashboard');
        Route::get('opportunities', OpportunitiesController::class)->name('opportunities.index');
        Route::get('projects', ProjectsController::class)->name('projects.index');
        Route::get('projects/{project}', ProjectShowController::class)
            ->whereNumber('project')
            ->name('projects.show');
        Route::get('proposals', ProposalsController::class)->name('proposals.index');
        Route::get('invoices', InvoicesController::class)->name('invoices.index');
        Route::get('invoices/create', InvoiceCreateController::class)->name('invoices.create');
        Route::get('invoices/{invoice}', InvoiceShowController::class)
            ->whereNumber('invoice')
            ->name('invoices.show');
    });

Route::middleware(['auth'])->group(function () {
    Route::get('invitations/{invitation}/accept', [TeamInvitationController::class, 'accept'])->name('invitations.accept');
    Route::delete('invitations/{invitation}', [TeamInvitationController::class, 'decline'])->name('invitations.decline');
});

require __DIR__.'/settings.php';

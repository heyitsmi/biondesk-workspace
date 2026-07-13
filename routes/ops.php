<?php

use App\Http\Controllers\OpsActivityLogIndexController;
use App\Http\Controllers\OpsAiUsageLogIndexController;
use App\Http\Controllers\OpsDashboardController;
use App\Http\Controllers\OpsUserIndexController;
use App\Http\Middleware\EnsureSuperAdmin;
use Illuminate\Support\Facades\Route;

Route::prefix('ops')
    ->middleware(['auth', 'verified', EnsureSuperAdmin::class])
    ->name('ops.')
    ->group(function () {
        Route::get('dashboard', OpsDashboardController::class)->name('dashboard');
        Route::get('users', OpsUserIndexController::class)->name('users.index');
        Route::get('ai-usage-logs', OpsAiUsageLogIndexController::class)->name('ai-usage-logs.index');
        Route::get('activity-logs', OpsActivityLogIndexController::class)->name('activity-logs.index');
    });

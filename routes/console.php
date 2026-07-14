<?php

use App\Models\TeamInvitation;
use Illuminate\Support\Facades\Schedule;

Schedule::call(function () {
    TeamInvitation::query()
        ->whereNotNull('expires_at')
        ->where('expires_at', '<', now())
        ->delete();
})->daily()->description('Delete expired team invitations');

Schedule::command('reminders:generate')->daily();
Schedule::command('invoices:generate-recurring')->daily()->withoutOverlapping();
Schedule::command('workflow-automations:run-due')->daily()->withoutOverlapping();
Schedule::command('blog:generate')->days([1, 4])->at('08:00')->description('Generate SEO blog content using OpenAI');

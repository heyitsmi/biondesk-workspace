<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class OpsActivityLogIndexController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(): Response
    {
        $activities = Activity::query()
            ->with('causer:id,name,email')
            ->latest('created_at')
            ->paginate(25)
            ->through(fn (Activity $activity) => [
                'id' => $activity->id,
                'logName' => $activity->log_name,
                'description' => $activity->description,
                'event' => $activity->event,
                'subjectType' => $activity->subject_type !== null ? class_basename($activity->subject_type) : null,
                'subjectId' => $activity->subject_id,
                'causerName' => $activity->causer instanceof User ? $activity->causer->name : null,
                'createdAt' => $activity->created_at?->format('M j, Y H:i'),
            ])
            ->withQueryString();

        return Inertia::render('ops/activity-logs/index', [
            'activities' => $activities,
        ]);
    }
}

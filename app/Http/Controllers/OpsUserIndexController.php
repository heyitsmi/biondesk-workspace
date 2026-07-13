<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class OpsUserIndexController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(): Response
    {
        $users = User::query()
            ->withCount('teams')
            ->latest()
            ->paginate(25)
            ->through(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'teamsCount' => $user->teams_count,
                'isSuperAdmin' => $user->is_super_admin,
                'emailVerified' => $user->email_verified_at !== null,
                'joinedAt' => $user->created_at?->format('M j, Y'),
            ])
            ->withQueryString();

        return Inertia::render('ops/users/index', [
            'users' => $users,
        ]);
    }
}

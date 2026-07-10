<?php

namespace App\Http\Controllers;

use App\Enums\ContactType;
use App\Http\Requests\StoreContactRequest;
use App\Http\Requests\UpdateContactRequest;
use App\Models\Contact;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    /**
     * Show the contacts index page.
     */
    public function index(Request $request): Response
    {
        $team = $request->user()->currentTeam;
        $contacts = $team->contacts()->latest()->get();

        return Inertia::render('contacts/index', [
            'contacts' => $contacts->map->toListItem()->all(),
            'contactsCount' => (string) $contacts->count(),
            'defaultFilters' => [
                'search' => '',
                'type' => '',
            ],
        ]);
    }

    /**
     * Show the new-contact page.
     */
    public function create(Request $request): Response
    {
        $team = $request->user()->currentTeam;

        return Inertia::render('contacts/create', [
            'contactsCount' => (string) $team->contacts()->count(),
            'defaults' => [
                'type' => ContactType::Client->value,
                'company' => '',
                'firstName' => '',
                'lastName' => '',
                'email' => '',
                'phone' => '',
                'role' => '',
                'location' => '',
                'website' => '',
                'notes' => '',
            ],
        ]);
    }

    /**
     * Store a newly created contact.
     */
    public function store(StoreContactRequest $request): RedirectResponse
    {
        $team = $request->user()->currentTeam;

        $contact = $team->contacts()->create($request->validated());

        if ($request->boolean('quick_add')) {
            Inertia::flash('toast', ['type' => 'success', 'message' => __('Client added.')]);

            return back()->with('quickAddedContact', $contact->toOption());
        }

        return to_route('contacts.show', ['current_team' => $team->slug, 'contact' => $contact->id]);
    }

    /**
     * Show the contact detail page.
     */
    public function show(Request $request, string $current_team, int $contact): Response
    {
        $team = $request->user()->currentTeam;
        $model = $team->contacts()->findOrFail($contact);

        return Inertia::render('contacts/show', [
            'contactsCount' => (string) $team->contacts()->count(),
            'contact' => $model->toDetailArray(),
        ]);
    }

    /**
     * Show the edit-contact page.
     */
    public function edit(Request $request, string $current_team, int $contact): Response
    {
        $team = $request->user()->currentTeam;
        $model = $team->contacts()->findOrFail($contact);

        return Inertia::render('contacts/edit', [
            'contactsCount' => (string) $team->contacts()->count(),
            'contact' => $model->toDetailArray(),
        ]);
    }

    /**
     * Update the given contact.
     */
    public function update(UpdateContactRequest $request, string $current_team, int $contact): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $model = $team->contacts()->findOrFail($contact);

        $model->update($request->validated());

        return to_route('contacts.show', ['current_team' => $team->slug, 'contact' => $model->id]);
    }

    /**
     * Delete the given contact.
     */
    public function destroy(Request $request, string $current_team, int $contact): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $model = $team->contacts()->findOrFail($contact);
        $model->delete();

        return to_route('contacts.index', ['current_team' => $team->slug]);
    }
}

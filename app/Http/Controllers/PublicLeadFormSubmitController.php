<?php

namespace App\Http\Controllers;

use App\Enums\ContactStatus;
use App\Enums\ContactType;
use App\Enums\OpportunityStage;
use App\Http\Requests\StorePublicLeadRequest;
use App\Mail\NewPublicLeadReceived;
use App\Models\Team;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Mail;

class PublicLeadFormSubmitController extends Controller
{
    /**
     * Budget range values to their display label.
     *
     * @var array<string, string>
     */
    private const BUDGET_LABELS = [
        'under5k' => 'Under $5,000',
        '5k_10k' => '$5,000 - $10,000',
        '10k_25k' => '$10,000 - $25,000',
        'over25k' => '$25,000+',
    ];

    /**
     * Handle the incoming request.
     */
    public function __invoke(StorePublicLeadRequest $request, string $team): RedirectResponse
    {
        $team = Team::findByLeadFormSlug($team);

        $data = $request->validated();

        $contact = $team->contacts()
            ->whereRaw('LOWER(email) = ?', [mb_strtolower($data['email'])])
            ->first();

        if ($contact === null) {
            $contact = $team->contacts()->create([
                'type' => ContactType::Lead,
                'status' => ContactStatus::Prospect,
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'email' => $data['email'],
                'company' => $data['company'] ?? null,
            ]);
        }

        $services = array_values(array_filter($data['services'], 'is_string'));
        $budget = is_string($data['budget'] ?? null) ? $data['budget'] : null;
        $message = is_string($data['message']) ? $data['message'] : '';

        $description = $this->buildDescription($services, $budget, $message);

        $opportunity = $team->opportunities()->create([
            'contact_id' => $contact->id,
            'title' => ($contact->company ?: $contact->fullName()).' — New Inquiry',
            'stage' => OpportunityStage::Inbox,
            'source' => 'Public form',
            'description' => $description,
        ]);

        if ($owner = $team->owner()) {
            Mail::to($owner->email)->send(new NewPublicLeadReceived($contact, $opportunity));
        }

        return back();
    }

    /**
     * @param  array<int, string>  $services
     */
    private function buildDescription(array $services, ?string $budget, string $message): string
    {
        $servicesLabel = collect($services)->implode(', ');
        $budgetLabel = self::BUDGET_LABELS[$budget ?? ''] ?? null;

        return trim(implode("\n\n", array_filter([
            "Interested in: {$servicesLabel}",
            $budgetLabel !== null ? "Estimated budget: {$budgetLabel}" : null,
            $message,
        ])));
    }
}

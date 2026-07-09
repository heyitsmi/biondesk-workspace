<?php

namespace App\Http\Controllers;

use App\Enums\DocumentType;
use App\Models\Contact;
use App\Models\DocumentItem;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProposalEditController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request, string $current_team, int $proposal): Response
    {
        $team = $request->user()->currentTeam;
        $document = $team->documents()->where('type', DocumentType::Proposal)->with('items')->find($proposal);

        abort_if($document === null, 404);

        return Inertia::render('proposals/edit', [
            'clients' => Contact::optionsFor($team),
            'projects' => Project::optionsFor($team),
            'proposal' => [
                'id' => $document->id,
                'title' => $document->title ?? '',
                'number' => $document->number,
                'clientId' => $document->contact_id ?? '',
                'datePrepared' => $document->issued_at?->toDateString() ?? '',
                'validUntil' => $document->valid_until?->toDateString() ?? '',
                'content' => $document->content ?? '',
                'lineItems' => $document->items->map(fn (DocumentItem $item) => [
                    'name' => $item->name,
                    'description' => $item->description ?? '',
                    'qty' => $item->quantity,
                    'price' => (string) $item->unit_price_value,
                ])->all(),
                'notes' => $document->notes ?? '',
            ],
        ]);
    }
}

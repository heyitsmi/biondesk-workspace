<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Support\ClientPortal\ClientPortalData;
use Inertia\Inertia;
use Inertia\Response;

class ClientPortalController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Contact $contact, ClientPortalData $clientPortalData): Response
    {
        return Inertia::render('client/portal', $clientPortalData->forContact($contact));
    }
}

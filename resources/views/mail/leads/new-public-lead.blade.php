@component('mail::message')
# New lead via your public form

**{{ $contact->fullName() }}**{{ $contact->company ? " ({$contact->company})" : '' }} just submitted your public lead form.

- **Email:** {{ $contact->email }}
@if ($contact->phone)
- **Phone:** {{ $contact->phone }}
@endif

@if ($opportunity->description)
**Message:**

{{ $opportunity->description }}
@endif

The opportunity has been added to your **Inbox** stage, ready for follow-up.

@component('mail::button', ['url' => config('app.url')])
Open Biondesk
@endcomponent

Thanks,<br>
{{ config('app.name') }}
@endcomponent

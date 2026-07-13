@component('mail::message')
# New Invoice: {{ $document->number }}

Hi {{ $document->clientName() }},

A new invoice **{{ $document->number }}** for **{{ $document->formattedTotal() }}** has been generated{{ $document->due_at !== null ? ", due on **{$document->due_at->format('M j, Y')}**" : '' }}.

@component('mail::button', ['url' => $document->shareUrl()])
View Invoice
@endcomponent

Thanks,<br>
{{ $document->team->name }}
@endcomponent

@component('mail::message')
# {{ $type->emailSubject($document->number) }}

Hi {{ $document->clientName() }},

@if ($type === \App\Enums\ReminderJobType::InvoiceDueSoon)
This is a friendly reminder that invoice **{{ $document->number }}** for **{{ $document->formattedTotal() }}** is due on **{{ $document->due_at?->format('M j, Y') }}**.
@elseif ($type === \App\Enums\ReminderJobType::InvoiceOverdue)
Invoice **{{ $document->number }}** for **{{ $document->formattedTotal() }}** was due on **{{ $document->due_at?->format('M j, Y') }}** and is now overdue. Please arrange payment as soon as possible.
@else
Quotation **{{ $document->number }}** is still awaiting your response. Please take a look when you have a moment.
@endif

@component('mail::button', ['url' => $document->shareUrl()])
View {{ $document->type->label() }}
@endcomponent

Thanks,<br>
{{ $document->team->name }}
@endcomponent

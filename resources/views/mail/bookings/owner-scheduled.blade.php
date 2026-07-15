<x-mail::message>
# New booking received

{{ $booking->fullName() }} booked **{{ $booking->bookingLink->name }}**.

<x-mail::panel>
**When:** {{ $booking->starts_at->format('M j, Y H:i') }} - {{ $booking->ends_at->format('H:i') }} {{ $booking->timezone }}  
**Email:** {{ $booking->email }}  
@if($booking->company)
**Company:** {{ $booking->company }}  
@endif
@if($booking->bookingLink->location)
**Location:** {{ $booking->bookingLink->location }}
@endif
</x-mail::panel>

@if($booking->notes)
**Notes**

{{ $booking->notes }}
@endif

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>

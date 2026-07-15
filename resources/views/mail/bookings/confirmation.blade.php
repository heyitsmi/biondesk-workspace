<x-mail::message>
# Booking confirmed

Hi {{ $booking->first_name }},

Your **{{ $booking->bookingLink->name }}** with {{ $booking->team->name }} is scheduled.

<x-mail::panel>
**When:** {{ $booking->starts_at->format('M j, Y H:i') }} - {{ $booking->ends_at->format('H:i') }} {{ $booking->timezone }}  
@if($booking->bookingLink->location)
**Location:** {{ $booking->bookingLink->location }}
@endif
</x-mail::panel>

@if($booking->notes)
**Your notes**

{{ $booking->notes }}
@endif

Thanks,<br>
{{ $booking->team->name }}
</x-mail::message>

<?php

namespace App\Support\Booking;

use App\Enums\BookingStatus;
use App\Models\BookingLink;
use App\Models\Event;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;

class BookingSlotService
{
    /**
     * Build public slot groups for a booking link.
     *
     * @return array<int, array{date: string, label: string, slots: array<int, array{startsAt: string, time: string}>}>
     */
    public function groupedSlots(BookingLink $bookingLink, ?CarbonInterface $now = null): array
    {
        $timezone = $bookingLink->timezone;
        $startBoundary = CarbonImmutable::instance($now ?? now($timezone))
            ->setTimezone($timezone)
            ->addMinutes($bookingLink->min_notice_minutes);
        $endBoundary = CarbonImmutable::instance($now ?? now($timezone))
            ->setTimezone($timezone)
            ->addDays($bookingLink->max_days_ahead)
            ->endOfDay();

        $events = $this->blockingEvents($bookingLink, $startBoundary, $endBoundary);
        $groups = [];

        for (
            $date = $startBoundary->startOfDay();
            $date->lessThanOrEqualTo($endBoundary);
            $date = $date->addDay()
        ) {
            $slots = $this->slotsForDate($bookingLink, $date, $startBoundary, $endBoundary, $events);

            if ($slots !== []) {
                $groups[] = [
                    'date' => $date->format('Y-m-d'),
                    'label' => $date->format('D, M j'),
                    'slots' => $slots,
                ];
            }
        }

        return $groups;
    }

    /**
     * Determine whether a submitted slot can still be booked.
     */
    public function isSlotAvailable(BookingLink $bookingLink, string $startsAt): bool
    {
        $start = $this->parseSlotStart($startsAt, $bookingLink->timezone);
        $end = $start->addMinutes($bookingLink->duration_minutes);
        $now = now($bookingLink->timezone);
        $min = CarbonImmutable::instance($now)->addMinutes($bookingLink->min_notice_minutes);
        $max = CarbonImmutable::instance($now)->addDays($bookingLink->max_days_ahead)->endOfDay();

        if ($start->lessThan($min) || $end->greaterThan($max)) {
            return false;
        }

        if (! $this->matchesAvailability($bookingLink, $start, $end)) {
            return false;
        }

        if ($this->hasScheduledBooking($bookingLink, $start)) {
            return false;
        }

        return ! $this->conflictsWithEvents(
            $bookingLink,
            $start->subMinutes($bookingLink->buffer_before_minutes),
            $end->addMinutes($bookingLink->buffer_after_minutes),
            $this->blockingEvents($bookingLink, $start->startOfDay(), $end->endOfDay()),
        );
    }

    /**
     * Parse a public slot timestamp in the booking link's local timezone.
     */
    public function parseSlotStart(string $startsAt, string $timezone): CarbonImmutable
    {
        return CarbonImmutable::createFromFormat('Y-m-d\TH:i:s', $startsAt, $timezone)
            ?: CarbonImmutable::parse($startsAt, $timezone);
    }

    /**
     * @param  Collection<int, Event>  $events
     * @return array<int, array{startsAt: string, time: string}>
     */
    private function slotsForDate(
        BookingLink $bookingLink,
        CarbonImmutable $date,
        CarbonImmutable $startBoundary,
        CarbonImmutable $endBoundary,
        Collection $events,
    ): array {
        $windows = $bookingLink->availability[strtolower($date->format('l'))] ?? [];

        if (! is_array($windows) || $windows === []) {
            return [];
        }

        $slots = [];
        $stepMinutes = $bookingLink->duration_minutes;

        foreach ($windows as $window) {
            if (! is_array($window) || ! is_string($window['start'] ?? null) || ! is_string($window['end'] ?? null)) {
                continue;
            }

            $windowStart = $date->setTimeFromTimeString($window['start']);
            $windowEnd = $date->setTimeFromTimeString($window['end']);

            for ($slotStart = $windowStart; $slotStart->addMinutes($bookingLink->duration_minutes)->lessThanOrEqualTo($windowEnd); $slotStart = $slotStart->addMinutes($stepMinutes)) {
                $slotEnd = $slotStart->addMinutes($bookingLink->duration_minutes);

                if ($slotStart->lessThan($startBoundary) || $slotEnd->greaterThan($endBoundary)) {
                    continue;
                }

                if ($this->hasScheduledBooking($bookingLink, $slotStart)) {
                    continue;
                }

                if ($this->conflictsWithEvents(
                    $bookingLink,
                    $slotStart->subMinutes($bookingLink->buffer_before_minutes),
                    $slotEnd->addMinutes($bookingLink->buffer_after_minutes),
                    $events,
                )) {
                    continue;
                }

                $slots[] = [
                    'startsAt' => $slotStart->format('Y-m-d\TH:i:s'),
                    'time' => $slotStart->format('H:i'),
                ];
            }
        }

        return $slots;
    }

    private function matchesAvailability(BookingLink $bookingLink, CarbonImmutable $start, CarbonImmutable $end): bool
    {
        $windows = $bookingLink->availability[strtolower($start->format('l'))] ?? [];

        if (! is_array($windows)) {
            return false;
        }

        foreach ($windows as $window) {
            if (! is_array($window) || ! is_string($window['start'] ?? null) || ! is_string($window['end'] ?? null)) {
                continue;
            }

            $windowStart = $start->startOfDay()->setTimeFromTimeString($window['start']);
            $windowEnd = $start->startOfDay()->setTimeFromTimeString($window['end']);

            if ($start->greaterThanOrEqualTo($windowStart) && $end->lessThanOrEqualTo($windowEnd)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @return Collection<int, Event>
     */
    private function blockingEvents(BookingLink $bookingLink, CarbonImmutable $start, CarbonImmutable $end): Collection
    {
        return $bookingLink->team
            ->events()
            ->where(function ($query) use ($start, $end): void {
                $query
                    ->whereNotNull('recurrence')
                    ->orWhere(function ($query) use ($start, $end): void {
                        $query
                            ->where('starts_at', '<', $end->format('Y-m-d H:i:s'))
                            ->where(function ($query) use ($start): void {
                                $query
                                    ->whereNull('ends_at')
                                    ->orWhere('ends_at', '>', $start->format('Y-m-d H:i:s'));
                            });
                    });
            })
            ->get();
    }

    /**
     * @param  Collection<int, Event>  $events
     */
    private function conflictsWithEvents(
        BookingLink $bookingLink,
        CarbonImmutable $start,
        CarbonImmutable $end,
        Collection $events,
    ): bool {
        foreach ($events as $event) {
            foreach ($this->eventOccurrences($event, $start, $end, $bookingLink->timezone) as $occurrence) {
                if ($start->lessThan($occurrence['end']) && $end->greaterThan($occurrence['start'])) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * @return array<int, array{start: CarbonImmutable, end: CarbonImmutable}>
     */
    private function eventOccurrences(Event $event, CarbonImmutable $windowStart, CarbonImmutable $windowEnd, string $timezone): array
    {
        if (! $event->isRecurring()) {
            $start = CarbonImmutable::parse($event->starts_at->format('Y-m-d H:i:s'), $timezone);
            $end = $event->all_day
                ? $start->endOfDay()
                : CarbonImmutable::parse(($event->ends_at ?? $event->starts_at->copy()->addMinutes(30))->format('Y-m-d H:i:s'), $timezone);

            return [['start' => $event->all_day ? $start->startOfDay() : $start, 'end' => $end]];
        }

        $occurrences = [];
        $baseStart = CarbonImmutable::parse($event->starts_at->format('Y-m-d H:i:s'), $timezone);
        $durationMinutes = $event->ends_at
            ? max(1, (int) $event->starts_at->diffInMinutes($event->ends_at))
            : 30;

        for ($date = $windowStart->startOfDay(); $date->lessThanOrEqualTo($windowEnd); $date = $date->addDay()) {
            if ($date->lessThan($baseStart->startOfDay()) || ! $this->dateMatchesRecurrence($date, $baseStart, $event->recurrence->value)) {
                continue;
            }

            $start = $date->setTime((int) $baseStart->format('H'), (int) $baseStart->format('i'));
            $end = $event->all_day ? $start->endOfDay() : $start->addMinutes($durationMinutes);

            $occurrences[] = ['start' => $event->all_day ? $start->startOfDay() : $start, 'end' => $end];
        }

        return $occurrences;
    }

    private function dateMatchesRecurrence(CarbonImmutable $date, CarbonImmutable $baseStart, string $recurrence): bool
    {
        return match ($recurrence) {
            'daily' => true,
            'weekly' => $date->dayOfWeek === $baseStart->dayOfWeek,
            'monthly' => $date->day === $baseStart->day,
            'yearly' => $date->month === $baseStart->month && $date->day === $baseStart->day,
            default => false,
        };
    }

    private function hasScheduledBooking(BookingLink $bookingLink, CarbonImmutable $start): bool
    {
        return $bookingLink->bookings()
            ->where('status', BookingStatus::Scheduled->value)
            ->where('starts_at', $start->format('Y-m-d H:i:s'))
            ->exists();
    }
}

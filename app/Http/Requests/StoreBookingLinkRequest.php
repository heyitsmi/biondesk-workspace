<?php

namespace App\Http\Requests;

use App\Models\BookingLink;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreBookingLinkRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $name = (string) $this->input('name', '');
        $slug = (string) ($this->input('slug') ?: Str::slug($name));

        $this->merge([
            'slug' => $slug,
            'is_active' => $this->input('is_active', $this->input('isActive', true)),
            'duration_minutes' => $this->input('duration_minutes', $this->input('durationMinutes', 30)),
            'buffer_before_minutes' => $this->input('buffer_before_minutes', $this->input('bufferBeforeMinutes', 0)),
            'buffer_after_minutes' => $this->input('buffer_after_minutes', $this->input('bufferAfterMinutes', 0)),
            'min_notice_minutes' => $this->input('min_notice_minutes', $this->input('minNoticeMinutes', 120)),
            'max_days_ahead' => $this->input('max_days_ahead', $this->input('maxDaysAhead', 14)),
            'availability' => $this->input('availability', BookingLink::defaultAvailability()),
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $teamId = $this->user()->currentTeam->id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('booking_links', 'slug')->where('team_id', $teamId),
            ],
            'description' => ['nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
            'duration_minutes' => ['required', 'integer', 'min:15', 'max:240'],
            'buffer_before_minutes' => ['required', 'integer', 'min:0', 'max:240'],
            'buffer_after_minutes' => ['required', 'integer', 'min:0', 'max:240'],
            'timezone' => ['required', 'timezone'],
            'availability' => ['required', 'array'],
            'min_notice_minutes' => ['required', 'integer', 'min:0', 'max:10080'],
            'max_days_ahead' => ['required', 'integer', 'min:1', 'max:180'],
            'location' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $this->validateAvailability($validator);
            },
        ];
    }

    private function validateAvailability(Validator $validator): void
    {
        $availability = $this->input('availability');

        if (! is_array($availability)) {
            return;
        }

        foreach (array_keys(BookingLink::defaultAvailability()) as $day) {
            $windows = $availability[$day] ?? [];

            if (! is_array($windows)) {
                $validator->errors()->add("availability.{$day}", 'Availability windows must be an array.');

                continue;
            }

            foreach ($windows as $index => $window) {
                if (! is_array($window)) {
                    $validator->errors()->add("availability.{$day}.{$index}", 'Availability window is invalid.');

                    continue;
                }

                $start = $window['start'] ?? null;
                $end = $window['end'] ?? null;

                if (! is_string($start) || ! preg_match('/^\d{2}:\d{2}$/', $start)) {
                    $validator->errors()->add("availability.{$day}.{$index}.start", 'Start time must use HH:MM format.');
                }

                if (! is_string($end) || ! preg_match('/^\d{2}:\d{2}$/', $end)) {
                    $validator->errors()->add("availability.{$day}.{$index}.end", 'End time must use HH:MM format.');
                }

                if (is_string($start) && is_string($end) && $start >= $end) {
                    $validator->errors()->add("availability.{$day}.{$index}.end", 'End time must be after start time.');
                }
            }
        }
    }
}

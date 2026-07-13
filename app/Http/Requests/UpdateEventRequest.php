<?php

namespace App\Http\Requests;

use App\Enums\EventColor;
use App\Enums\EventRecurrence;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEventRequest extends FormRequest
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
        $this->merge([
            'starts_at' => $this->input('starts_at', $this->input('startsAt')),
            'ends_at' => $this->input('ends_at', $this->input('endsAt')) ?: null,
            'all_day' => $this->input('all_day', $this->input('allDay', false)),
            'color' => $this->input('color') ?: EventColor::Accent->value,
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'starts_at' => ['required', 'date'],
            'ends_at' => [
                'nullable',
                'date',
                Rule::when(fn () => ! $this->boolean('all_day'), ['after:starts_at']),
            ],
            'all_day' => ['boolean'],
            'location' => ['nullable', 'string', 'max:255'],
            'color' => ['required', Rule::enum(EventColor::class)],
            'recurrence' => ['nullable', Rule::enum(EventRecurrence::class)],
        ];
    }
}

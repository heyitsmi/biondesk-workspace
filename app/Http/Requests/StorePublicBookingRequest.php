<?php

namespace App\Http\Requests;

use App\Rules\ValidTurnstileToken;
use Illuminate\Foundation\Http\FormRequest;

class StorePublicBookingRequest extends FormRequest
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
            'first_name' => $this->input('first_name', $this->input('firstName')),
            'last_name' => $this->input('last_name', $this->input('lastName')),
            'starts_at' => $this->input('starts_at', $this->input('startsAt')),
            'turnstile_token' => $this->input('turnstile_token', $this->input('turnstileToken')),
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
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'company' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:3000'],
            'starts_at' => ['required', 'date_format:Y-m-d\TH:i:s'],
            'turnstile_token' => ['required', new ValidTurnstileToken],
        ];
    }
}

<?php

namespace App\Http\Requests;

use App\Enums\OpportunityPriority;
use App\Enums\OpportunityStage;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOpportunityRequest extends FormRequest
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
            'contact_id' => $this->input('contact_id', $this->input('contactId')),
            'amount_value' => $this->input('amount_value', $this->input('amountValue')) ?: 0,
            'close_date' => $this->input('close_date', $this->input('closeDate')) ?: null,
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $teamId = $this->user()->currentTeam->id;

        return [
            'title' => ['required', 'string', 'max:255'],
            'contact_id' => [
                'required',
                Rule::exists('contacts', 'id')->where('team_id', $teamId),
            ],
            'amount_value' => ['nullable', 'integer', 'min:0'],
            'stage' => ['required', Rule::enum(OpportunityStage::class)],
            'close_date' => ['nullable', 'date'],
            'priority' => ['required', Rule::enum(OpportunityPriority::class)],
            'description' => ['nullable', 'string'],
        ];
    }
}

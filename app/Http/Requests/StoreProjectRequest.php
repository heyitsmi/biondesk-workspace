<?php

namespace App\Http\Requests;

use App\Enums\ProjectStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProjectRequest extends FormRequest
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
            'opportunity_id' => $this->input('opportunity_id', $this->input('opportunityId')),
            'start_date' => $this->input('start_date', $this->input('startDate')) ?: null,
            'due_date' => $this->input('due_date', $this->input('dueDate')) ?: null,
            'budget_value' => $this->input('budget_value', $this->input('budgetValue')) ?: 0,
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
            'opportunity_id' => [
                'required',
                Rule::exists('opportunities', 'id')->where('team_id', $teamId),
                Rule::unique('projects', 'opportunity_id'),
            ],
            'title' => ['required', 'string', 'max:255'],
            'status' => ['nullable', Rule::enum(ProjectStatus::class)],
            'start_date' => ['nullable', 'date'],
            'due_date' => ['nullable', 'date'],
            'description' => ['nullable', 'string'],
            'budget_value' => ['nullable', 'integer', 'min:0'],
        ];
    }
}

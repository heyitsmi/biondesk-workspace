<?php

namespace App\Http\Requests;

use App\Enums\ProjectStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProjectRequest extends FormRequest
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
     *
     * Only the dedicated edit page sends start_date/due_date/budget_value; the project
     * show page's inline "Details" editor only sends title/status/description. Fields
     * are only normalized (and therefore only validated/persisted) when actually present,
     * so a partial submission never clobbers the fields it didn't send.
     */
    protected function prepareForValidation(): void
    {
        $merge = [];

        if ($this->has('start_date') || $this->has('startDate')) {
            $merge['start_date'] = $this->input('start_date', $this->input('startDate')) ?: null;
        }

        if ($this->has('due_date') || $this->has('dueDate')) {
            $merge['due_date'] = $this->input('due_date', $this->input('dueDate')) ?: null;
        }

        if ($this->has('budget_value') || $this->has('budgetValue')) {
            $merge['budget_value'] = $this->input('budget_value', $this->input('budgetValue')) ?: 0;
        }

        if ($merge !== []) {
            $this->merge($merge);
        }
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
            'status' => ['required', Rule::enum(ProjectStatus::class)],
            'start_date' => ['sometimes', 'nullable', 'date'],
            'due_date' => ['sometimes', 'nullable', 'date'],
            'description' => ['sometimes', 'nullable', 'string'],
            'budget_value' => ['sometimes', 'nullable', 'integer', 'min:0'],
        ];
    }
}

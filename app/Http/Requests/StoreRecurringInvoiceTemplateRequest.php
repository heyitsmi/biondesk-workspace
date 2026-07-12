<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRecurringInvoiceTemplateRequest extends FormRequest
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
            'contact_id' => $this->input('contact_id', $this->input('clientId')),
            'project_id' => $this->input('project_id', $this->input('projectId')) ?: null,
            'interval_months' => $this->input('interval_months', $this->input('intervalMonths')),
            'due_days' => $this->input('due_days', $this->input('dueDays')),
            'starts_at' => $this->input('starts_at', $this->input('startsAt')),
            'ends_at' => $this->input('ends_at', $this->input('endsAt')) ?: null,
            'tax_percent' => $this->input('tax_percent', $this->input('taxPercent')) ?: 0,
            'auto_send' => $this->input('auto_send', $this->input('autoSend', true)),
            'items' => collect((array) $this->input('items', []))->map(fn (array $item) => [
                'name' => $item['name'] ?? '',
                'description' => $item['description'] ?? null,
                'quantity' => $item['quantity'] ?? $item['qty'] ?? 1,
                'unit_price_value' => (int) round((float) ($item['unit_price_value'] ?? $item['price'] ?? 0)),
            ])->all(),
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
            'contact_id' => [
                'required',
                Rule::exists('contacts', 'id')->where('team_id', $teamId),
            ],
            'project_id' => [
                'nullable',
                Rule::exists('projects', 'id')->where('team_id', $teamId),
            ],
            'title' => ['nullable', 'string', 'max:255'],
            'currency' => ['required', 'string', 'max:8'],
            'notes' => ['nullable', 'string'],
            'tax_percent' => ['nullable', 'integer', 'min:0', 'max:100'],
            'interval_months' => ['required', 'integer', 'min:1', 'max:12'],
            'due_days' => ['required', 'integer', 'min:0', 'max:90'],
            'starts_at' => ['required', 'date'],
            'ends_at' => ['nullable', 'date', 'after:starts_at'],
            'auto_send' => ['boolean'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.name' => ['required', 'string', 'max:255'],
            'items.*.description' => ['nullable', 'string'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.unit_price_value' => ['required', 'integer', 'min:0'],
        ];
    }
}

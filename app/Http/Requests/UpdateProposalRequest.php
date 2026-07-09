<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProposalRequest extends FormRequest
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
            'issued_at' => $this->input('issued_at', $this->input('datePrepared')) ?: null,
            'valid_until' => $this->input('valid_until', $this->input('validUntil')) ?: null,
            'discount_percent' => $this->input('discount_percent', $this->input('discountPercent')) ?: 0,
            'tax_percent' => $this->input('tax_percent', $this->input('taxPercent')) ?: 0,
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
            'title' => ['required', 'string', 'max:255'],
            'contact_id' => [
                'required',
                Rule::exists('contacts', 'id')->where('team_id', $teamId),
            ],
            'project_id' => [
                'nullable',
                Rule::exists('projects', 'id')->where('team_id', $teamId),
            ],
            'issued_at' => ['nullable', 'date'],
            'valid_until' => ['nullable', 'date'],
            'currency' => ['required', 'string', 'max:8'],
            'content' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'discount_percent' => ['nullable', 'integer', 'min:0', 'max:100'],
            'tax_percent' => ['nullable', 'integer', 'min:0', 'max:100'],
            'items' => ['array'],
            'items.*.name' => ['required', 'string', 'max:255'],
            'items.*.description' => ['nullable', 'string'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.unit_price_value' => ['required', 'integer', 'min:0'],
        ];
    }
}

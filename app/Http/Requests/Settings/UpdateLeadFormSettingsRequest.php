<?php

namespace App\Http\Requests\Settings;

use App\Enums\LeadFormBackgroundTheme;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateLeadFormSettingsRequest extends FormRequest
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
        $camelCaseFallbacks = [
            'welcome_message' => 'welcomeMessage',
            'background_theme' => 'backgroundTheme',
            'ask_budget' => 'askBudget',
            'allow_attachments' => 'allowAttachments',
        ];

        $merge = [];

        foreach ($camelCaseFallbacks as $snakeCase => $camelCase) {
            if (! $this->has($snakeCase) && $this->has($camelCase)) {
                $merge[$snakeCase] = $this->input($camelCase);
            }
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
            'enabled' => ['sometimes', 'boolean'],
            'title' => ['sometimes', 'string', 'max:255'],
            'welcome_message' => ['sometimes', 'nullable', 'string'],
            'background_theme' => ['sometimes', Rule::enum(LeadFormBackgroundTheme::class)],
            'services' => ['sometimes', 'array'],
            'services.*' => ['string', 'max:100'],
            'ask_budget' => ['sometimes', 'boolean'],
            'allow_attachments' => ['sometimes', 'boolean'],
            'banner' => ['sometimes', 'image', 'max:2048'],
        ];
    }
}

<?php

namespace App\Http\Requests\Settings;

use App\Enums\LeadFormBackgroundTheme;
use App\Enums\SocialLinkPlatform;
use App\Models\Team;
use Closure;
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
        // Move any camelCase file uploads to their snake_case keys first, before
        // anything below touches has()/input() — those call Request::allFiles(),
        // which memoizes its result on first access. Mutating the file bag after
        // that point would stay invisible to hasFile()/file() for the rest of the
        // request, including in the controller.
        $camelCaseFileFallbacks = [
            'background_image' => 'backgroundImage',
            'cover_banner' => 'coverBanner',
            'og_image' => 'ogImage',
        ];

        foreach ($camelCaseFileFallbacks as $snakeCase => $camelCase) {
            if (! $this->files->has($snakeCase) && $this->files->has($camelCase)) {
                $this->files->set($snakeCase, $this->files->get($camelCase));
            }
        }

        $camelCaseFallbacks = [
            'lead_form_slug' => 'leadFormSlug',
            'welcome_message' => 'welcomeMessage',
            'background_theme' => 'backgroundTheme',
            'background_color' => 'backgroundColor',
            'social_links' => 'socialLinks',
            'meta_title' => 'metaTitle',
            'meta_description' => 'metaDescription',
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

        if ($this->has('lead_form_slug') && trim((string) $this->input('lead_form_slug')) === '') {
            $this->merge(['lead_form_slug' => null]);
        }

        if ($this->has('background_color') && trim((string) $this->input('background_color')) === '') {
            $this->merge(['background_color' => null]);
        }

        if ($this->has('meta_title') && trim((string) $this->input('meta_title')) === '') {
            $this->merge(['meta_title' => null]);
        }

        if ($this->has('meta_description') && trim((string) $this->input('meta_description')) === '') {
            $this->merge(['meta_description' => null]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $team = $this->user()?->currentTeam;

        return [
            'enabled' => ['sometimes', 'boolean'],
            'lead_form_slug' => [
                'sometimes',
                'nullable',
                'string',
                'min:3',
                'max:60',
                'regex:/^[a-z0-9]+(-[a-z0-9]+)*$/',
                function (string $attribute, mixed $value, Closure $fail) use ($team): void {
                    if ($value !== null && Team::leadFormSlugTaken($value, $team?->id)) {
                        $fail('This link is already taken.');
                    }
                },
            ],
            'title' => ['sometimes', 'string', 'max:255'],
            'welcome_message' => ['sometimes', 'nullable', 'string'],
            'background_theme' => ['sometimes', Rule::enum(LeadFormBackgroundTheme::class)],
            'background_color' => ['sometimes', 'nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'background_image' => ['sometimes', 'nullable', 'image', 'max:5120'],
            'cover_banner' => ['sometimes', 'nullable', 'image', 'max:5120'],
            'services' => ['sometimes', 'array'],
            'services.*' => ['string', 'max:100'],
            'social_links' => ['sometimes', 'array', 'max:8'],
            'social_links.*.platform' => ['required', Rule::enum(SocialLinkPlatform::class)],
            'social_links.*.url' => ['required', 'url', 'max:500'],
            'meta_title' => ['sometimes', 'nullable', 'string', 'max:255'],
            'meta_description' => ['sometimes', 'nullable', 'string', 'max:300'],
            'og_image' => ['sometimes', 'nullable', 'image', 'max:5120'],
            'ask_budget' => ['sometimes', 'boolean'],
            'allow_attachments' => ['sometimes', 'boolean'],
            'banner' => ['sometimes', 'nullable', 'image', 'max:2048'],
        ];
    }
}

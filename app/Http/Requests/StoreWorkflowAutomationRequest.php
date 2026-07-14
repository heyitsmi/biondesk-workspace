<?php

namespace App\Http\Requests;

use App\Enums\ProjectStatus;
use App\Enums\RequestLogStatus;
use App\Enums\TaskStatus;
use App\Enums\WorkflowAutomationAction;
use App\Enums\WorkflowAutomationTrigger;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreWorkflowAutomationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'template' => ['required', 'string', 'max:255'],
            'trigger' => ['required', Rule::enum(WorkflowAutomationTrigger::class)],
            'conditions' => ['nullable', 'array'],
            'actions' => ['required', 'array', 'min:1'],
            'actions.*.type' => ['required', Rule::enum(WorkflowAutomationAction::class)],
            'actions.*.title' => ['nullable', 'string', 'max:255'],
            'actions.*.description' => ['nullable', 'string'],
            'actions.*.status' => ['nullable', 'string', 'max:255'],
            'actions.*.tags' => ['nullable', 'array'],
            'actions.*.tags.*' => ['string', 'max:40'],
            'actions.*.delay_days' => ['nullable', 'integer', 'min:0', 'max:30'],
            'actions.*.message' => ['nullable', 'string'],
            'actions.*.tone' => ['nullable', 'string', 'max:40'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            foreach ((array) $this->input('actions', []) as $index => $action) {
                $type = WorkflowAutomationAction::tryFrom((string) ($action['type'] ?? ''));
                $status = (string) ($action['status'] ?? '');

                if ($type === WorkflowAutomationAction::CreateTask && $status !== '' && ! TaskStatus::tryFrom($status)) {
                    $validator->errors()->add("actions.{$index}.status", 'The selected task status is invalid.');
                }

                if ($type === WorkflowAutomationAction::UpdateRequestStatus && ! RequestLogStatus::tryFrom($status)) {
                    $validator->errors()->add("actions.{$index}.status", 'The selected request status is invalid.');
                }

                if ($type === WorkflowAutomationAction::UpdateProjectStatus && ! ProjectStatus::tryFrom($status)) {
                    $validator->errors()->add("actions.{$index}.status", 'The selected project status is invalid.');
                }
            }
        });
    }
}

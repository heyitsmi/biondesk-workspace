<?php

namespace App\Http\Requests;

use App\Enums\TaskStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRequestLogAiTasksRequest extends FormRequest
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
            'tasks' => ['required', 'array', 'min:1', 'max:8'],
            'tasks.*.title' => ['required', 'string', 'max:120'],
            'tasks.*.description' => ['nullable', 'string', 'max:5000'],
            'tasks.*.status' => ['required', Rule::enum(TaskStatus::class)],
            'tasks.*.tags' => ['array', 'max:6'],
            'tasks.*.tags.*' => ['string', 'max:30'],
            'tasks.*.source_reason' => ['nullable', 'string', 'max:1000'],
        ];
    }
}

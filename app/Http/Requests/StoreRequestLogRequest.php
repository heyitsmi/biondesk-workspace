<?php

namespace App\Http\Requests;

use App\Enums\RequestLogClassification;
use App\Enums\RequestLogSource;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRequestLogRequest extends FormRequest
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
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'text' => ['required', 'string'],
            'source' => ['nullable', Rule::enum(RequestLogSource::class)],
            'classification' => ['nullable', Rule::enum(RequestLogClassification::class)],
            'notes' => ['nullable', 'string'],
            'attachments' => ['nullable', 'array'],
            'attachments.*' => ['file', 'max:10240'],
        ];
    }
}

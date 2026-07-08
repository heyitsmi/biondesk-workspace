<?php

namespace App\Http\Requests;

use App\Enums\OpportunityStage;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MoveOpportunityStageRequest extends FormRequest
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
            'stage' => ['required', Rule::enum(OpportunityStage::class)],
        ];
    }
}

<?php

namespace App\Http\Controllers;

use App\Support\Ai\AiGenerationException;
use App\Support\Ai\AiTextGeneratorFactory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProposalAiDraftController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request, AiTextGeneratorFactory $factory): JsonResponse
    {
        $brief = trim((string) $request->input('brief', ''));

        if ($brief === '') {
            return response()->json(['error' => 'A brief is required.']);
        }

        $systemPrompt = <<<'PROMPT'
            You are an assistant that drafts client-facing business proposals for a
            creative/software studio. Given a brief describing the client's goals,
            respond with exactly this format:

            Title: <a short proposal title, under 8 words>

            <2-4 paragraphs of proposal content covering understanding of the client's
            goals, the proposed approach, and the value delivered. Do not include a
            line item table, pricing, or a title heading in the content itself.>
            PROMPT;

        try {
            $raw = $factory->make()->generate($systemPrompt, $brief);
        } catch (AiGenerationException $exception) {
            return response()->json(['error' => $exception->getMessage()]);
        }

        [$title, $content] = $this->splitTitleAndContent($raw, $brief);

        return response()->json(['title' => $title, 'content' => $content]);
    }

    /**
     * Split the "Title: ...\n\n..." response into its title and content parts,
     * falling back to a title derived from the brief if the format isn't matched.
     *
     * @return array{0: string, 1: string}
     */
    private function splitTitleAndContent(string $raw, string $brief): array
    {
        $raw = trim($raw);

        if (preg_match('/^Title:\s*(.+?)\s*\n+(.*)$/is', $raw, $matches) === 1) {
            return [trim($matches[1]), trim($matches[2])];
        }

        $fallbackTitle = trim(explode("\n", $brief)[0]);

        return [mb_strimwidth($fallbackTitle, 0, 60, ''), $raw];
    }
}

<?php

namespace App\Support\AiChat\Tools;

use App\Models\Team;
use Throwable;

class ToolRegistry
{
    /**
     * @param  list<Tool>  $tools
     */
    public function __construct(private readonly array $tools) {}

    /**
     * Build the registry with every v1 BionAI tool.
     */
    public static function default(): self
    {
        return new self([
            new GetOverdueInvoicesTool,
            new GetTodayScheduleTool,
            new GetUpcomingDeadlinesTool,
            new GetOpenTasksTool,
            new GetProjectStatusSummaryTool,
            new GetPipelineSummaryTool,
            new GetInvoicePaymentStatusTool,
        ]);
    }

    /**
     * Get the JSON-Schema definitions for every registered tool, to send to the AI provider.
     *
     * @return list<ToolSchema>
     */
    public function schemas(): array
    {
        return array_map(
            fn (Tool $tool) => new ToolSchema($tool->name(), $tool->description(), $tool->parameters()),
            $this->tools,
        );
    }

    /**
     * Execute a tool by name. Never throws: an unknown tool name or an
     * exception inside execute() both return a structured error the model
     * can see and recover from, rather than crashing the chat turn.
     *
     * @param  array<string, mixed>  $args
     * @return array<string, mixed>
     */
    public function call(string $name, array $args, Team $team): array
    {
        $tool = collect($this->tools)->first(fn (Tool $tool) => $tool->name() === $name);

        if ($tool === null) {
            return ['error' => "Unknown tool: {$name}"];
        }

        try {
            return $tool->execute($team, $args);
        } catch (Throwable $exception) {
            report($exception);

            return ['error' => 'Tool execution failed.'];
        }
    }
}

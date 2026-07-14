<?php

namespace App\Support\Embeddings;

use App\Models\RequestLog;
use App\Models\RequestLogMessage;
use App\Models\Task;
use Illuminate\Support\Str;

class EmbeddingTextBuilder
{
    public function forTask(Task $task): string
    {
        return $this->join([
            "Task title: {$task->title}",
            'Task status: '.$task->status->value,
            'Task description: '.($task->description ?: 'None'),
            'Task tags: '.implode(', ', $task->tags ?? []),
        ]);
    }

    public function forRequestLog(RequestLog $requestLog): string
    {
        $requestLog->loadMissing(['messages.user', 'messages.contact', 'media']);

        return $this->join([
            "Request: {$requestLog->text}",
            'Classification: '.$requestLog->classification->value,
            'Status: '.$requestLog->status->value,
            'Internal notes: '.($requestLog->notes ?: 'None'),
            'Attachments: '.$requestLog->getMedia('attachments')->pluck('file_name')->join(', '),
            'Thread: '.$requestLog->messages
                ->map(fn (RequestLogMessage $message) => $this->join([
                    $message->author_type->value.': '.$message->body,
                    'Attachments: '.$message->getMedia('attachments')->pluck('file_name')->join(', '),
                ]))
                ->join("\n"),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function taskMetadata(Task $task): array
    {
        return [
            'id' => $task->id,
            'title' => $task->title,
            'status' => $task->status->value,
            'description' => $task->description ?? '',
            'tags' => $task->tags ?? [],
        ];
    }

    /**
     * @param  list<string>  $parts
     */
    private function join(array $parts): string
    {
        return Str::of(implode("\n", $parts))
            ->replaceMatches('/[ \t]+/', ' ')
            ->trim()
            ->limit(8000, '')
            ->toString();
    }
}

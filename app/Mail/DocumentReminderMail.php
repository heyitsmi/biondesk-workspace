<?php

namespace App\Mail;

use App\Models\ReminderJob;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DocumentReminderMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(public ReminderJob $reminderJob) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->reminderJob->type->emailSubject($this->reminderJob->document->number),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'mail.reminders.document-reminder',
            with: [
                'document' => $this->reminderJob->document,
                'type' => $this->reminderJob->type,
            ],
        );
    }
}

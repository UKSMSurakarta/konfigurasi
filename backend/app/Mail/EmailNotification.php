<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EmailNotification extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public string $emailSubject,
        public string $htmlBody,
        public ?string $plainText = null,
        public array $emailAttachments = []
    ) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->emailSubject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        $content = new Content(
            view: 'emails.notification',
            with: [
                'body' => $this->htmlBody,
            ],
        );

        if ($this->plainText) {
            $content->text = 'emails.notification_plain';
        }

        return $content;
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        $attachments = [];

        foreach ($this->emailAttachments as $attachment) {
            if (isset($attachment['path'])) {
                $file = Attachment::fromPath($attachment['path']);
                
                if (isset($attachment['as'])) {
                    $file->as($attachment['as']);
                }
                
                if (isset($attachment['mime'])) {
                    $file->withMime($attachment['mime']);
                }

                $attachments[] = $file;
            }
        }

        return $attachments;
    }
}

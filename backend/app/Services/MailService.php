<?php

namespace App\Services;

use App\Mail\EmailNotification;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class MailService
{
    /**
     * Send an email with automatic retries and logging.
     *
     * @param string $to Recipient email address
     * @param string $subject Email subject
     * @param string $body HTML body content
     * @param array $attachments Optional attachments
     * @param int|null $maxRetries Maximum retry attempts (overrides env)
     * @return bool Success status
     */
    public function send(
        string $to,
        string $subject,
        string $body,
        array $attachments = [],
        ?int $maxRetries = null
    ): bool {
        // 1. Validate Email Format
        if (!$this->isValidEmail($to)) {
            Log::error("MailService: Invalid recipient email format: {$to}");
            return false;
        }

        $attempts = $maxRetries ?? config('mail.retry_attempts', 3);

        try {
            // 2. Retry Logic
            retry($attempts, function () use ($to, $subject, $body, $attachments) {
                Mail::to($to)->send(new EmailNotification($subject, $body, null, $attachments));
            }, 100); // 100ms delay between retries

            // 3. Log Success
            Log::info("MailService: Email sent successfully to {$to}. Subject: {$subject}");
            return true;

        } catch (Exception $e) {
            // 4. Log Failure
            Log::error("MailService: Failed to send email to {$to} after {$attempts} attempts. Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Validate if the given string is a valid email address.
     *
     * @param string $email
     * @return bool
     */
    public function isValidEmail(string $email): bool
    {
        $validator = Validator::make(['email' => $email], [
            'email' => 'required|email:rfc'
        ]);

        return !$validator->fails();
    }
}

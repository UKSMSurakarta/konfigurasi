<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class LevelVerifiedNotification extends Notification
{
    use Queueable;

    protected $details;

    public function __construct($details)
    {
        $this->details = $details;
    }

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'level_name' => $this->details['level_name'],
            'status' => $this->details['status'],
            'catatan' => $this->details['catatan'],
            'level_id' => $this->details['level_id'],
            'message' => "Level {$this->details['level_name']} Anda telah " . ($this->details['status'] === 'disetujui' ? 'disetujui.' : 'ditolak dengan catatan: ' . $this->details['catatan']),
            'type' => 'assessment_verification'
        ];
    }
}

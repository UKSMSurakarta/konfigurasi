<?php

namespace App\Notifications;

use App\Models\Pengumuman;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PengumumanNotification extends Notification
{
    use Queueable;

    protected Pengumuman $pengumuman;

    public function __construct(Pengumuman $pengumuman)
    {
        $this->pengumuman = $pengumuman;
    }

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'type'         => 'pengumuman',
            'pengumuman_id'=> $this->pengumuman->id,
            'judul'        => $this->pengumuman->judul,
            'isi'          => $this->pengumuman->isi,
            'sender_name'  => $this->pengumuman->sender->name ?? 'Administrator',
            'message'      => "Pengumuman baru: {$this->pengumuman->judul}",
        ];
    }
}

<?php

namespace App\Observers;

use App\Models\LevelSubmission;
use App\Models\AuditLog;

class LevelSubmissionObserver
{
    /**
     * Handle the LevelSubmission "updated" event.
     */
    public function updated(LevelSubmission $levelSubmission): void
    {
        if ($levelSubmission->wasChanged('status') && $levelSubmission->status === 'final') {
            AuditLog::create([
                'user_id' => auth()->id(),
                'action' => 'SUBMIT_FINAL',
                'auditable_type' => LevelSubmission::class,
                'auditable_id' => $levelSubmission->id,
                'details' => "Sekolah ID {$levelSubmission->sekolah_id} telah melakukan submit final untuk Level ID {$levelSubmission->level_id} dengan skor {$levelSubmission->total_skor}.",
                'ip_address' => request()->ip(),
            ]);
        }
    }
}

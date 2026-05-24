<?php

namespace App\Services;

use App\Models\Level;
use App\Models\LevelSubmission;
use App\Models\AssessmentPeriod;

class AssessmentService
{
    /**
     * Get the current active period.
     */
    public function getActivePeriod()
    {
        return AssessmentPeriod::where('is_active', true)->first();
    }

    /**
     * Determine the status of a level for a specific school.
     */
    public function getLevelStatus($level, $sekolahId, $periodId)
    {
        $submission = LevelSubmission::where('level_id', $level->id)
            ->where('sekolah_id', $sekolahId)
            ->where('period_id', $periodId)
            ->first();

        // verified = terkunci permanen oleh admin
        if ($submission && $submission->status === 'verified') {
            return 'verified';
        }

        // final = dikunci oleh sekolah (tapi masih bisa di-edit via store())
        if ($submission && $submission->status === 'final') {
            return 'final';
        }

        // submitted = sudah disimpan, masih bisa direvisi
        if ($submission && $submission->status === 'submitted') {
            return 'submitted';
        }

        // Level pertama selalu unlocked
        if ($level->urutan === 1) {
            return $submission ? 'draft' : 'unlocked';
        }

        // Cek apakah level sebelumnya sudah disubmit
        $prevLevel = Level::where('period_id', $level->period_id)
            ->where('urutan', $level->urutan - 1)
            ->first();

        if (!$prevLevel) return 'unlocked';

        $prevSubmission = LevelSubmission::where('level_id', $prevLevel->id)
            ->where('sekolah_id', $sekolahId)
            ->where('period_id', $periodId)
            ->first();

        // Level berikutnya terbuka jika level sebelumnya sudah submitted, final, atau verified
        if ($prevSubmission && in_array($prevSubmission->status, ['submitted', 'final', 'verified'])) {
            return $submission ? 'draft' : 'unlocked';
        }

        return 'locked';
    }

    /**
     * Calculate completion percentage for a level.
     */
    public function calculateProgress($level, $sekolahId, $periodId)
    {
        $totalQuestions = $level->pertanyaans()->count();
        if ($totalQuestions === 0) return 0;

        $answeredQuestions = \App\Models\Jawaban::where('sekolah_id', $sekolahId)
            ->where('period_id', $periodId)
            ->whereIn('pertanyaan_id', $level->pertanyaans()->pluck('id'))
            ->count();

        return round(($answeredQuestions / $totalQuestions) * 100);
    }

    /**
     * Get global assessment stats for a school.
     */
    public function getSchoolStats($sekolahId, $periodId)
    {
        $levels = Level::where('period_id', $periodId)->get();
        $totalLevels = $levels->count();
        $completedLevels = LevelSubmission::where('sekolah_id', $sekolahId)
            ->where('period_id', $periodId)
            ->whereIn('status', ['final', 'verified'])
            ->count();

        $totalQuestions = \App\Models\Pertanyaan::whereIn('level_id', $levels->pluck('id'))->count();
        $answeredQuestions = \App\Models\Jawaban::where('sekolah_id', $sekolahId)
            ->where('period_id', $periodId)
            ->count();

        $overallProgress = $totalQuestions > 0 ? round(($answeredQuestions / $totalQuestions) * 100) : 0;

        return [
            'kategori_selesai' => "{$completedLevels} / {$totalLevels}",
            'indikator_terisi' => "{$answeredQuestions} / {$totalQuestions}",
            'progress' => $overallProgress,
            'is_verified' => LevelSubmission::where('sekolah_id', $sekolahId)
                ->where('period_id', $periodId)
                ->where('status', 'verified')
                ->count() === $totalLevels && $totalLevels > 0
        ];
    }
}

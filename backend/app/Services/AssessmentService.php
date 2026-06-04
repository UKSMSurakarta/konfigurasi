<?php

namespace App\Services;

use App\Models\Level;
use App\Models\LevelSubmission;
use App\Models\AssessmentPeriod;
use Illuminate\Support\Facades\Cache;
use App\Models\Jawaban;

class AssessmentService
{
    /**
     * Get the current active period.
     */
    public function getActivePeriod()
    {
        return Cache::remember('active_assessment_period', 3600, function () {
            return AssessmentPeriod::where('is_active', true)->first();
        });
    }

    /**
     * Check if the deadline for the active period has passed.
     */
    public function isDeadlinePassed()
    {
        $period = $this->getActivePeriod();
        if (!$period) return false;

        return now()->isAfter($period->tanggal_selesai->endOfDay());
    }

    /**
     * Get all submissions for a school in a period.
     */
    public function getSubmissions($sekolahId, $periodId)
    {
        // For current request lifecycle caching (optional, since it's already fast with indexing)
        return LevelSubmission::where('sekolah_id', $sekolahId)
            ->where('period_id', $periodId)
            ->get();
    }

    /**
     * Determine the status of a level for a specific school.
     */
    public function getLevelStatus($level, $sekolahId, $periodId, $submissions = null)
    {
        if ($submissions === null) {
            $submissions = $this->getSubmissions($sekolahId, $periodId);
        }

        $submission = $submissions->where('level_id', $level->id)->first();

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
        // We can get the previous level by looking at cache or statically if we assume sequential order,
        // but for now, we query. To be fully optimized, $level->urutan - 1 logic can be done with submissions.
        $prevLevelId = Level::where('period_id', $level->period_id)
            ->where('urutan', $level->urutan - 1)
            ->value('id');

        if (!$prevLevelId) return 'unlocked';

        $prevSubmission = $submissions->where('level_id', $prevLevelId)->first();

        // Level berikutnya terbuka jika level sebelumnya sudah submitted, final, atau verified
        if ($prevSubmission && in_array($prevSubmission->status, ['submitted', 'final', 'verified'])) {
            return $submission ? 'draft' : 'unlocked';
        }

        return 'locked';
    }

    /**
     * Calculate completion percentage for a level.
     */
    public function calculateProgress($level, $sekolahId, $periodId, $allJawabans = null)
    {
        $totalQuestions = $level->pertanyaans()->count();
        if ($totalQuestions === 0) return 0;

        if ($allJawabans === null) {
            $answeredQuestions = Jawaban::where('sekolah_id', $sekolahId)
                ->where('period_id', $periodId)
                ->whereIn('pertanyaan_id', $level->pertanyaans()->pluck('id'))
                ->count();
        } else {
            $levelPertanyaanIds = clone $level->pertanyaans()->pluck('id');
            $answeredQuestions = $allJawabans->whereIn('pertanyaan_id', $levelPertanyaanIds)->count();
        }

        return round(($answeredQuestions / $totalQuestions) * 100);
    }

    /**
     * Get global assessment stats for a school.
     */
    public function getSchoolStats($sekolahId, $periodId)
    {
        $levels = Cache::remember("levels_period_{$periodId}", 3600, function () use ($periodId) {
            return Level::where('period_id', $periodId)->get();
        });
        
        $totalLevels = $levels->count();
        
        $submissions = $this->getSubmissions($sekolahId, $periodId);
        $completedLevels = $submissions->whereIn('status', ['final', 'verified'])->count();
        $verifiedLevels = $submissions->where('status', 'verified')->count();

        $totalQuestions = Cache::remember("total_questions_period_{$periodId}", 3600, function () use ($levels) {
            return \App\Models\Pertanyaan::whereIn('level_id', $levels->pluck('id'))->count();
        });

        $answeredQuestions = Jawaban::where('sekolah_id', $sekolahId)
            ->where('period_id', $periodId)
            ->count();

        $overallProgress = $totalQuestions > 0 ? round(($answeredQuestions / $totalQuestions) * 100) : 0;

        return [
            'kategori_selesai' => "{$completedLevels} / {$totalLevels}",
            'indikator_terisi' => "{$answeredQuestions} / {$totalQuestions}",
            'progress' => $overallProgress,
            'is_verified' => $verifiedLevels === $totalLevels && $totalLevels > 0
        ];
    }
}


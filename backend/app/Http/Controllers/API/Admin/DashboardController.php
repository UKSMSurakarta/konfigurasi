<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Sekolah;
use App\Models\LevelSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $opdId = auth()->user()->opd_id;
        $activePeriod = DB::table('assessment_periods')->where('is_active', true)->first();
        $activePeriodId = $activePeriod ? $activePeriod->id : null;

        // 1. Total Sekolah in this OPD
        $totalSekolah = Sekolah::where('opd_id', $opdId)->count();

        // 2. Classify School Statuses
        // A school is 'verified' if its highest submission is verified
        // A school is 'final' if its highest submission is final (waiting verification)
        // A school is 'belum' otherwise
        $terverifikasiCount = 0;
        $menungguCount = 0;

        if ($activePeriodId) {
            $schoolSubmissions = LevelSubmission::where('period_id', $activePeriodId)
                ->whereIn('sekolah_id', Sekolah::where('opd_id', $opdId)->pluck('id'))
                ->get()
                ->groupBy('sekolah_id');

            foreach ($schoolSubmissions as $sekolahId => $subs) {
                if ($subs->contains('status', 'verified')) {
                    $terverifikasiCount++;
                } elseif ($subs->contains('status', 'final')) {
                    $menungguCount++;
                }
            }
        }

        $belumSelesaiCount = $totalSekolah - $terverifikasiCount - $menungguCount;

        // 3. Sekolah Perlu Perhatian
        // List schools with their current active progress
        $sekolahsInOpd = Sekolah::where('opd_id', $opdId)->get();
        $sekolahPerluPerhatian = [];

        foreach ($sekolahsInOpd as $sekolah) {
            $progress = 0;
            if ($activePeriodId) {
                $verifiedLevels = LevelSubmission::where('sekolah_id', $sekolah->id)
                    ->where('period_id', $activePeriodId)
                    ->where('status', 'verified')
                    ->count();
                $finalLevels = LevelSubmission::where('sekolah_id', $sekolah->id)
                    ->where('period_id', $activePeriodId)
                    ->where('status', 'final')
                    ->count();
                
                // Assuming 4 levels total
                $progress = round((($verifiedLevels + $finalLevels) / 4) * 100);
            }

            if ($progress < 100) {
                $sekolahPerluPerhatian[] = [
                    'id' => $sekolah->id,
                    'nama' => $sekolah->nama,
                    'jenjang' => $sekolah->jenjang,
                    'progress' => $progress
                ];
            }
        }

        // Sort by progress ascending
        usort($sekolahPerluPerhatian, function($a, $b) {
            return $a['progress'] <=> $b['progress'];
        });

        // 4. Rekap Predikat (Strata)
        $predikatCounts = [
            'Strata Minimal' => 0,
            'Strata Standar' => 0,
            'Strata Optimal' => 0,
            'Strata Paripurna' => 0
        ];

        if ($activePeriodId) {
            foreach ($schoolSubmissions as $sekolahId => $subs) {
                // Find highest verified level
                $highestVerifiedUrutan = 0;
                foreach ($subs as $sub) {
                    if ($sub->status === 'verified') {
                        // get level urutan
                        $level = DB::table('levels')->find($sub->level_id);
                        if ($level && $level->urutan > $highestVerifiedUrutan) {
                            $highestVerifiedUrutan = $level->urutan;
                        }
                    }
                }

                if ($highestVerifiedUrutan === 1) {
                    $predikatCounts['Strata Minimal']++;
                } elseif ($highestVerifiedUrutan === 2) {
                    $predikatCounts['Strata Standar']++;
                } elseif ($highestVerifiedUrutan === 3) {
                    $predikatCounts['Strata Optimal']++;
                } elseif ($highestVerifiedUrutan === 4) {
                    $predikatCounts['Strata Paripurna']++;
                }
            }
        }

        $rekapPredikat = [
            ['label' => 'Strata Minimal', 'jumlah' => $predikatCounts['Strata Minimal'], 'color' => '#3B82F6', 'bg' => '#EFF6FF'],
            ['label' => 'Strata Standar', 'jumlah' => $predikatCounts['Strata Standar'], 'color' => '#10B981', 'bg' => '#ECFDF5'],
            ['label' => 'Strata Optimal', 'jumlah' => $predikatCounts['Strata Optimal'], 'color' => '#F59E0B', 'bg' => '#FEF3C7'],
            ['label' => 'Strata Paripurna', 'jumlah' => $predikatCounts['Strata Paripurna'], 'color' => '#8B5CF6', 'bg' => '#F5F3FF'],
        ];

        // 5. Recent Announcements
        $recentPengumuman = DB::table('pengumumans')
            ->where(function($q) use ($opdId) {
                $q->where('target_type', 'all')
                  ->orWhere(function($sub) use ($opdId) {
                      $sub->where('target_type', 'opd')
                          ->where('opd_id', $opdId);
                  });
            })
            ->where('is_published', true)
            ->orderBy('published_at', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Statistik dashboard admin berhasil diambil.',
            'data' => [
                'periode' => $activePeriod ? $activePeriod->nama : 'Tidak ada',
                'stats' => [
                    'total_sekolah' => $totalSekolah,
                    'terverifikasi' => $terverifikasiCount,
                    'menunggu_verifikasi' => $menungguCount,
                    'belum_selesai' => $belumSelesaiCount,
                ],
                'sekolah_perlu_perhatian' => $sekolahPerluPerhatian,
                'rekap_predikat' => $rekapPredikat,
                'recent_pengumuman' => $recentPengumuman
            ]
        ]);
    }

    public function monitoring()
    {
        $opdId = auth()->user()->opd_id;
        $activePeriodId = DB::table('assessment_periods')->where('is_active', true)->value('id');
        $totalLevels = DB::table('levels')->where('period_id', $activePeriodId)->count();

        $sekolahs = Sekolah::where('opd_id', $opdId)
            ->withCount([
                'levelSubmissions as draft_count' => function ($q) use ($activePeriodId) {
                    $q->where('period_id', $activePeriodId)->where('status', 'draft');
                },
                'levelSubmissions as final_count' => function ($q) use ($activePeriodId) {
                    $q->where('period_id', $activePeriodId)->where('status', 'final');
                },
                'levelSubmissions as verified_count' => function ($q) use ($activePeriodId) {
                    $q->where('period_id', $activePeriodId)->where('status', 'verified');
                }
            ])
            ->get()
            ->map(function ($s) use ($totalLevels, $activePeriodId) {
                $completed = $s->final_count + $s->verified_count;
                $submissions = LevelSubmission::where('sekolah_id', $s->id)
                    ->where('period_id', $activePeriodId);
                
                $totalSkor = $submissions->where('status', 'verified')->sum('total_skor');
                $lastSubmit = $submissions->max('submitted_at');
                
                return [
                    'id' => $s->id,
                    'nama' => $s->nama,
                    'jenjang' => $s->jenjang,
                    'npsn' => $s->npsn,
                    'kepala_sekolah' => $s->kepala_sekolah,
                    'telepon' => $s->telepon,
                    'progress_percent' => $totalLevels > 0 ? round(($completed / $totalLevels) * 100) : 0,
                    'total_skor' => (int)$totalSkor,
                    'status_counts' => [
                        'draft' => (int)$s->draft_count,
                        'final' => (int)$s->final_count,
                        'verified' => (int)$s->verified_count,
                    ],
                    'last_submit' => $lastSubmit
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $sekolahs
        ]);
    }
}

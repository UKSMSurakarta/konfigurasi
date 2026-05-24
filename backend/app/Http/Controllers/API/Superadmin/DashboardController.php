<?php

namespace App\Http\Controllers\API\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\Sekolah;
use App\Models\Opd;
use App\Models\AssessmentPeriod;
use App\Models\LevelSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    protected $service;

    public function __construct(\App\Services\AssessmentService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        $totalSekolah = Sekolah::count();
        $totalOpd = Opd::count();
        $activePeriod = AssessmentPeriod::where('is_active', true)->first();
        
        // Calculate stats for active period
        $activePeriodId = $activePeriod ? $activePeriod->id : null;

        // Count of schools that have started or completed assessment in active period
        $sekolahSudahMengisi = 0;
        if ($activePeriodId) {
            $sekolahSudahMengisi = LevelSubmission::where('period_id', $activePeriodId)
                ->distinct('sekolah_id')
                ->count();
        }

        // Stats by status for active period (mapped to what frontend expects in monitoring)
        $selesaiCount = 0;
        $menungguCount = 0;
        $belumCount = $totalSekolah;

        if ($activePeriodId) {
            // Group schools by their latest/highest status in the active period
            $schoolSubmissions = LevelSubmission::where('period_id', $activePeriodId)
                ->get()
                ->groupBy('sekolah_id');

            foreach ($schoolSubmissions as $sekolahId => $subs) {
                // If any is verified
                if ($subs->contains('status', 'verified')) {
                    $selesaiCount++;
                    $belumCount--;
                } elseif ($subs->contains('status', 'final') || $subs->contains('status', 'submitted')) {
                    $menungguCount++;
                    $belumCount--;
                } elseif ($subs->contains('status', 'draft')) {
                    // Draft is considered "Proses" / "Belum Selesai"
                    // So it remains in $belumCount
                }
            }
        }

        $persentaseMengisi = $totalSekolah > 0 ? round(($selesaiCount / $totalSekolah) * 100) : 0;

        // Progress per OPD
        $opdProgress = [];
        $opds = Opd::all();
        foreach ($opds as $opd) {
            $opdSekolahs = Sekolah::where('opd_id', $opd->id)->pluck('id');
            $opdTotalSekolah = $opdSekolahs->count();
            
            $opdSelesai = 0;
            if ($activePeriodId && $opdTotalSekolah > 0) {
                $opdSelesai = LevelSubmission::where('period_id', $activePeriodId)
                    ->whereIn('sekolah_id', $opdSekolahs)
                    ->whereIn('status', ['verified', 'final'])
                    ->distinct('sekolah_id')
                    ->count();
            }

            $opdPersen = $opdTotalSekolah > 0 ? round(($opdSelesai / $opdTotalSekolah) * 100) : 0;

            $opdProgress[] = [
                'id' => $opd->id,
                'nama' => $opd->nama,
                'total_sekolah' => $opdTotalSekolah,
                'selesai' => $opdSelesai,
                'persentase' => $opdPersen
            ];
        }

        // Stats by Status
        $statsByStatus = [
            ['name' => 'Belum Mulai', 'value' => $totalSekolah - $sekolahSudahMengisi],
            ['name' => 'Sedang Mengisi', 'value' => $activePeriodId ? LevelSubmission::where('period_id', $activePeriodId)->where('status', 'draft')->distinct('sekolah_id')->count() : 0],
            ['name' => 'Selesai', 'value' => $selesaiCount],
        ];

        // Stats by Jenjang
        $statsByJenjang = Sekolah::select('jenjang', DB::raw('count(*) as value'))
            ->groupBy('jenjang')
            ->get()
            ->map(function ($item) {
                return ['name' => $item->jenjang, 'value' => $item->value];
            });

        return response()->json([
            'success' => true,
            'message' => 'Statistik dashboard superadmin berhasil diambil.',
            'data' => [
                // Root level fields for SuperadminDashboard.jsx StatCard usage
                'total_sekolah' => $totalSekolah,
                'total_opd' => $totalOpd,
                'periode_aktif' => $activePeriod ? $activePeriod->nama : 'Tidak ada',
                'progress_persen' => $persentaseMengisi,
                'rekap_opd' => $opdProgress,
                'opd_progress' => $opdProgress,
                'terverifikasi' => $selesaiCount,
                'menunggu_verifikasi' => $menungguCount,
                'belum_selesai' => $belumCount,
                
                // Keep the old summary structure for backward compatibility
                'summary' => [
                    'total_sekolah' => $totalSekolah,
                    'total_opd' => $totalOpd,
                    'active_period' => $activePeriod ? $activePeriod->nama : 'Tidak ada',
                    'persentase_mengisi' => $persentaseMengisi,
                ],
                'chart_status' => $statsByStatus,
                'chart_jenjang' => $statsByJenjang,
            ]
        ]);
    }

    public function monitoring(Request $request)
    {
        $activePeriod = AssessmentPeriod::where('is_active', true)->first();
        $activePeriodId = $activePeriod ? $activePeriod->id : null;

        $query = Sekolah::with(['opd', 'levelSubmissions' => function($q) use ($activePeriodId) {
            if ($activePeriodId) {
                $q->where('period_id', $activePeriodId);
            }
        }]);

        if ($request->opd_id) $query->where('opd_id', $request->opd_id);
        if ($request->jenjang) $query->where('jenjang', $request->jenjang);

        $sekolahs = $query->get()->map(function ($s) use ($activePeriodId) {
            $subs = $s->levelSubmissions;
            
            $status = 'Belum Selesai';
            $progress = 0;

            if ($subs->isNotEmpty()) {
                // Get dynamic progress and verified status from service
                $stats = $this->service->getSchoolStats($s->id, $activePeriodId);
                $progress = $stats['progress'];

                if ($subs->contains('status', 'verified')) {
                    $status = 'Terverifikasi';
                } elseif ($subs->contains('status', 'final')) {
                    $status = 'Menunggu Verifikasi';
                } elseif ($subs->contains('status', 'submitted')) {
                    $status = 'Menunggu Verifikasi';
                } elseif ($subs->contains('status', 'draft')) {
                    $status = 'Proses';
                }
            }

            return [
                'id' => $s->id,
                'nama' => $s->nama,
                'jenjang' => $s->jenjang,
                'opd' => $s->opd ? $s->opd->nama : '-',
                'status' => $status,
                'progress' => $progress,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $sekolahs
        ]);
    }
}

<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Sekolah;
use App\Models\Level;
use App\Models\LevelSubmission;
use App\Models\AssessmentPeriod;
use App\Models\Jawaban;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    /**
     * Rekapitulasi per sekolah.
     */
    public function rekapSekolah(Request $request)
    {
        $query = Sekolah::with(['opd', 'levelSubmissions' => function($q) use ($request) {
            if ($request->period_id) $q->where('period_id', $request->period_id);
            $q->whereIn('status', ['final', 'verified']);
        }]);

        if ($request->opd_id) $query->where('opd_id', $request->opd_id);
        if ($request->jenjang) $query->where('jenjang', $request->jenjang);

        $sekolahs = $query->get()->map(function($s) {
            $totalSkor = $s->levelSubmissions->sum('total_skor');
            $levelSelesai = $s->levelSubmissions->count();
            return [
                'id' => $s->id,
                'nama' => $s->nama,
                'jenjang' => $s->jenjang,
                'opd' => $s->opd ? $s->opd->nama : '-',
                'level_selesai' => $levelSelesai,
                'total_skor' => $totalSkor,
            ];
        })->sortByDesc('total_skor')->values();

        // Add Ranking
        $sekolahs = $sekolahs->map(function($item, $index) {
            $item['ranking'] = $index + 1;
            return $item;
        });

        return response()->json([
            'success' => true,
            'message' => 'Rekapitulasi sekolah berhasil diambil.',
            'data' => $sekolahs
        ]);
    }

    /**
     * Rekapitulasi per level.
     */
    public function rekapLevel(Request $request)
    {
        $periodId = $request->period_id ?? AssessmentPeriod::where('is_active', true)->value('id');
        
        $levels = Level::where('period_id', $periodId)->orderBy('urutan')->get();

        $data = $levels->map(function($level) use ($periodId) {
            $submissions = LevelSubmission::where('level_id', $level->id)
                ->where('period_id', $periodId)
                ->whereIn('status', ['final', 'verified']);

            return [
                'id' => $level->id,
                'nama' => $level->nama,
                'urutan' => $level->urutan,
                'total_final' => $submissions->count(),
                'avg_skor' => round($submissions->avg('total_skor'), 2),
                'max_skor' => $submissions->max('total_skor'),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    /**
     * Detail jawaban sekolah.
     */
    public function detailSekolah($sekolahId, Request $request)
    {
        $periodId = $request->period_id ?? AssessmentPeriod::where('is_active', true)->value('id');
        $sekolah = Sekolah::with('opd')->findOrFail($sekolahId);

        $levels = Level::where('period_id', $periodId)->orderBy('urutan')->get()->map(function($level) use ($sekolahId, $periodId) {
            $submission = LevelSubmission::where('level_id', $level->id)
                ->where('sekolah_id', $sekolahId)
                ->where('period_id', $periodId)
                ->first();

            $jawabans = Jawaban::with('pertanyaan')
                ->where('sekolah_id', $sekolahId)
                ->where('period_id', $periodId)
                ->whereIn('pertanyaan_id', $level->pertanyaans()->pluck('id'))
                ->get();

            return [
                'id' => $level->id,
                'nama' => $level->nama,
                'status' => $submission ? $submission->status : 'belum_mulai',
                'total_skor' => $submission ? $submission->total_skor : 0,
                'jawabans' => $jawabans->map(function($j) {
                    return [
                        'pertanyaan' => $j->pertanyaan->teks_pertanyaan,
                        'jawaban' => $j->jawaban_teks,
                        'nilai' => $j->nilai,
                        'bukti' => $j->file_path ? asset('storage/' . $j->file_path) : null,
                    ];
                })
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'sekolah' => $sekolah,
                'assessment' => $levels
            ]
        ]);
    }

    /**
     * Statistik Periode.
     */
    public function statistikPeriode($periodId)
    {
        $period = AssessmentPeriod::findOrFail($periodId);
        $totalSekolah = Sekolah::count();
        $sekolahFinal = LevelSubmission::where('period_id', $periodId)
            ->whereIn('status', ['final', 'verified'])
            ->distinct('sekolah_id')
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'nama_periode' => $period->nama,
                'total_sekolah' => $totalSekolah,
                'partisipasi' => [
                    'total' => $sekolahFinal,
                'persentase' => $totalSekolah > 0 ? round(($sekolahFinal / $totalSekolah) * 100, 2) : 0,
                ],
                'avg_total_skor' => round(LevelSubmission::where('period_id', $periodId)->whereIn('status', ['final', 'verified'])->avg('total_skor'), 2),
            ]
        ]);
    }
}

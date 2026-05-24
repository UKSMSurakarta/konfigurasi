<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Sekolah;
use App\Models\Level;
use App\Models\LevelSubmission;
use App\Models\Jawaban;
use App\Models\User;
use App\Notifications\LevelVerifiedNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VerificationController extends Controller
{
    protected $service;

    public function __construct(\App\Services\AssessmentService $service)
    {
        $this->service = $service;
    }

    /**
     * List schools with levels awaiting verification.
     */
    public function index()
    {
        $opdId = auth()->user()->opd_id;
        $period = $this->service->getActivePeriod();
        $periodId = $period ? $period->id : null;

        $sekolahs = Sekolah::where('opd_id', $opdId)
            ->whereHas('levelSubmissions', function($q) use ($periodId) {
                $q->whereIn('status', ['submitted', 'final'])->where('period_id', $periodId);
            })->with(['opd', 'levelSubmissions' => function($q) use ($periodId) {
                $q->whereIn('status', ['submitted', 'final', 'verified'])->where('period_id', $periodId)->with('level');
            }])->get();

        $data = $sekolahs->map(function ($s) use ($periodId) {
            $stats = $this->service->getSchoolStats($s->id, $periodId);
            $s->progress = $stats['progress'];
            $s->status = $s->levelSubmissions->contains('status', 'final') ? 'Menunggu Verifikasi' : 'Proses';
            if ($s->levelSubmissions->every('status', 'verified')) $s->status = 'Terverifikasi';
            return $s;
        });

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    /**
     * Verify a specific level for a school.
     */
    public function verify(Request $request, $sekolahId, $levelId)
    {
        $request->validate([
            'status' => 'required|in:disetujui,ditolak',
            'catatan' => 'nullable|string'
        ]);

        $submission = LevelSubmission::where('sekolah_id', $sekolahId)
            ->where('level_id', $levelId)
            ->firstOrFail();

        DB::transaction(function () use ($request, $submission, $sekolahId, $levelId) {
            if ($request->status === 'disetujui') {
                $submission->update([
                    'status' => 'verified',
                    'verified_at' => now(),
                    'verifier_id' => auth()->id(),
                    'catatan_verifikator' => $request->catatan
                ]);
            } else {
                // Reject: Return to draft so school can edit
                $submission->update([
                    'status' => 'draft',
                    'catatan_verifikator' => $request->catatan,
                    'submitted_at' => null // reset submission time
                ]);

                // Also unlock the answers
                Jawaban::where('sekolah_id', $sekolahId)
                    ->whereIn('pertanyaan_id', Level::find($levelId)->pertanyaans()->pluck('id'))
                    ->update(['is_final' => false]);
            }

            // Notify School
            $sekolahUser = User::where('sekolah_id', $sekolahId)->first();
            if ($sekolahUser) {
                $level = Level::find($levelId);
                $sekolahUser->notify(new LevelVerifiedNotification([
                    'level_name' => $level->nama,
                    'status' => $request->status,
                    'catatan' => $request->catatan,
                    'level_id' => $levelId
                ]));
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Verifikasi berhasil disimpan.'
        ]);
    }

    /**
     * Get full assessment details for a school (all levels, questions, answers).
     */
    public function showDetails($sekolahId)
    {
        $sekolah = Sekolah::with('opd')->findOrFail($sekolahId);
        $period = $this->service->getActivePeriod();
        $periodId = $period ? $period->id : null;

        $levels = Level::where('period_id', $periodId)->orderBy('urutan')->get();
        
        $details = $levels->map(function ($level) use ($sekolahId, $periodId) {
            $questions = $level->pertanyaans()
                ->with(['jawabans' => function($q) use ($sekolahId, $periodId) {
                    $q->where('sekolah_id', $sekolahId)->where('period_id', $periodId);
                }])
                ->orderBy('urutan')
                ->get()
                ->map(function($p) {
                    $j = $p->jawabans->first();
                    $links = [];
                    if ($j && $j->file_path) {
                        try {
                            $parsed = json_decode($j->file_path, true);
                            $links = is_array($parsed) ? $parsed : [$j->file_path];
                        } catch(\Exception $e) { $links = [$j->file_path]; }
                    }
                    return [
                        'id' => $p->id,
                        'pertanyaan' => $p->pertanyaan,
                        'jawaban' => $j ? ($j->jawaban_teks === 'ya' ? 'Memenuhi' : 'Belum Memenuhi') : 'Belum Dijawab',
                        'nilai' => $j ? $j->nilai : 0,
                        'bukti_links' => $links,
                    ];
                });

            $submission = LevelSubmission::where('sekolah_id', $sekolahId)
                ->where('level_id', $level->id)
                ->where('period_id', $periodId)
                ->first();

            return [
                'level_id' => $level->id,
                'level_nama' => $level->nama,
                'status' => $submission ? $submission->status : 'Belum Mulai',
                'questions' => $questions
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'sekolah' => $sekolah,
                'details' => $details,
                'stats' => $this->service->getSchoolStats($sekolahId, $periodId)
            ]
        ]);
    }
}

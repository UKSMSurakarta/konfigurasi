<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Sekolah;
use App\Models\Level;
use App\Models\LevelSubmission;
use App\Models\Jawaban;
use App\Models\User;
use App\Models\AuditLog;
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

        $sekolahs = Sekolah::where("opd_id", $opdId)
            ->whereHas("levelSubmissions", function ($q) use ($periodId) {
                $q->whereIn("status", ["submitted", "final"])->where(
                    "period_id",
                    $periodId,
                );
            })
            ->with([
                "opd",
                "levelSubmissions" => function ($q) use ($periodId) {
                    $q->whereIn("status", ["submitted", "final", "verified"])
                        ->where("period_id", $periodId)
                        ->with("level");
                },
            ])
            ->get();

        $data = $sekolahs->map(function ($s) use ($periodId) {
            $stats = $this->service->getSchoolStats($s->id, $periodId);
            $s->progress = $stats["progress"];
            $s->status = $s->levelSubmissions->contains("status", "final")
                ? "Menunggu Verifikasi"
                : "Proses";
            if ($s->levelSubmissions->every("status", "verified")) {
                $s->status = "Terverifikasi";
            }
            return $s;
        });

        return response()->json([
            "success" => true,
            "data" => $data,
        ]);
    }

    /**
     * Verify a specific level for a school.
     */
    public function verify(Request $request, $sekolahId, $levelId)
    {
        // IDOR Protection: verify school belongs to admin's OPD
        $user = auth()->user();
        if ($user->role !== 'superadmin') {
            $sekolah = Sekolah::where('id', $sekolahId)
                ->where('opd_id', $user->opd_id)
                ->first();
            if (!$sekolah) {
                return response()->json(['success' => false, 'message' => 'Sekolah tidak ditemukan.'], 403);
            }
        }

        $request->validate([
            "status" => "required|in:disetujui,ditolak",
            "catatan" => "nullable|string",
            "rejected_pertanyaan_ids" => "nullable|array",
            "rejected_pertanyaan_ids.*" => "integer|exists:pertanyaans,id",
        ]);

        $submission = LevelSubmission::where("sekolah_id", $sekolahId)
            ->where("level_id", $levelId)
            ->firstOrFail();

        DB::transaction(function () use (
            $request,
            $submission,
            $sekolahId,
            $levelId,
        ) {
            $level = Level::findOrFail($levelId);
            $allPertanyaanIds = $level->pertanyaans()->pluck("id")->toArray();

            if ($request->status === "disetujui") {
                $submission->update([
                    "status" => "verified",
                    "verified_at" => now(),
                    "verifier_id" => auth()->id(),
                    "catatan_verifikator" => $request->catatan,
                ]);

                // All answers in the level are locked and not rejected
                Jawaban::where("sekolah_id", $sekolahId)
                    ->whereIn("pertanyaan_id", $allPertanyaanIds)
                    ->update([
                        "is_final" => true,
                        "is_rejected" => false,
                    ]);
            } else {
                // Reject: Return to draft so school can edit
                $submission->update([
                    "status" => "draft",
                    "catatan_verifikator" => $request->catatan,
                    "submitted_at" => null, // reset submission time
                ]);

                $rejectedPertanyaanIds = $request->input("rejected_pertanyaan_ids", []);
                if (empty($rejectedPertanyaanIds)) {
                    $rejectedPertanyaanIds = $allPertanyaanIds;
                }

                // Unlock and mark rejected answers
                Jawaban::where("sekolah_id", $sekolahId)
                    ->whereIn("pertanyaan_id", $rejectedPertanyaanIds)
                    ->update([
                        "is_final" => false,
                        "is_rejected" => true,
                    ]);

                // Lock approved answers
                $approvedPertanyaanIds = array_diff($allPertanyaanIds, $rejectedPertanyaanIds);
                if (!empty($approvedPertanyaanIds)) {
                    Jawaban::where("sekolah_id", $sekolahId)
                        ->whereIn("pertanyaan_id", $approvedPertanyaanIds)
                        ->update([
                            "is_final" => true,
                            "is_rejected" => false,
                        ]);
                }
            }

            // Notify School
            $sekolahUser = User::where("sekolah_id", $sekolahId)->first();
            if ($sekolahUser) {
                $level = Level::find($levelId);
                $sekolahUser->notify(
                    new LevelVerifiedNotification([
                        "level_name" => $level->nama,
                        "status" => $request->status,
                        "catatan" => $request->catatan,
                        "level_id" => $levelId,
                    ]),
                );
            }
        });

        // Audit log
        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'VERIFY_SUBMISSION',
            'auditable_type' => LevelSubmission::class,
            'auditable_id' => $submission->id,
            'details' => "Verifikasi level {$levelId} sekolah {$sekolahId}: {$request->status}" . ($request->catatan ? " - {$request->catatan}" : ""),
            'ip_address' => request()->ip(),
        ]);

        return response()->json([
            "success" => true,
            "message" => "Verifikasi berhasil disimpan.",
        ]);
    }

    /**
     * Get full assessment details for a school (all levels, questions, answers).
     */
    public function showDetails($sekolahId)
    {
        // IDOR Protection: verify school belongs to admin's OPD
        $user = auth()->user();
        if ($user->role !== 'superadmin') {
            $sekolah = Sekolah::where('id', $sekolahId)
                ->where('opd_id', $user->opd_id)
                ->with('opd')
                ->first();
            if (!$sekolah) {
                return response()->json(['success' => false, 'message' => 'Sekolah tidak ditemukan.'], 403);
            }
        } else {
            $sekolah = Sekolah::with("opd")->findOrFail($sekolahId);
        }
        $period = $this->service->getActivePeriod();
        $periodId = $period ? $period->id : null;

        $levels = Level::where("period_id", $periodId)
            ->orderBy("urutan")
            ->get();

        $details = $levels->map(function ($level) use ($sekolahId, $periodId) {
            $questions = $level
                ->pertanyaans()
                ->with([
                    "jawabans" => function ($q) use ($sekolahId, $periodId) {
                        $q->where("sekolah_id", $sekolahId)->where(
                            "period_id",
                            $periodId,
                        );
                    },
                ])
                ->orderBy("urutan")
                ->get()
                ->map(function ($p) {
                    $j = $p->jawabans->first();
                    $links = [];
                    if ($j && $j->file_path) {
                        try {
                            $parsed = json_decode($j->file_path, true);
                            $links = is_array($parsed)
                                ? $parsed
                                : [$j->file_path];
                        } catch (\Exception $e) {
                            $links = [$j->file_path];
                        }
                    }
                    return [
                        "id" => $p->id,
                        "pertanyaan" => $p->teks_pertanyaan,
                        "jawaban" => $j
                            ? ($j->jawaban_teks === "ya"
                                ? "Memenuhi"
                                : "Belum Memenuhi")
                            : "Belum Dijawab",
                        "nilai" => $j ? $j->nilai : 0,
                        "bukti_links" => $links,
                        "is_rejected" => $j ? (bool)$j->is_rejected : false,
                    ];
                });

            $submission = LevelSubmission::where("sekolah_id", $sekolahId)
                ->where("level_id", $level->id)
                ->where("period_id", $periodId)
                ->first();

            return [
                "level_id" => $level->id,
                "level_nama" => $level->nama,
                "status" => $submission ? $submission->status : "Belum Mulai",
                "catatan_verifikator" => $submission
                    ? $submission->catatan_verifikator
                    : null,
                "verified_at" => $submission ? $submission->verified_at : null,
                "submitted_at" => $submission
                    ? $submission->submitted_at
                    : null,
                "questions" => $questions,
            ];
        });

        return response()->json([
            "success" => true,
            "data" => [
                "sekolah" => $sekolah,
                "details" => $details,
                "stats" => $this->service->getSchoolStats(
                    $sekolahId,
                    $periodId,
                ),
            ],
        ]);
    }
}

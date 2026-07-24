<?php

namespace App\Http\Controllers\API\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\AssessmentPeriod;
use App\Models\Sekolah;
use App\Models\SekolahSertifikat;
use App\Models\LevelSubmission;
use App\Models\Level;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class CertificateController extends Controller
{
    /**
     * Get list of schools that have been verified by OPD.
     * We consider a school verified if they have at least one verified LevelSubmission.
     */
    public function index(Request $request)
    {
        $period = AssessmentPeriod::where('is_active', true)->first();
        if (!$period) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak ada periode assessment aktif.'
            ], 404);
        }

        $search = $request->query('search');
        $opdId = $request->query('opd_id');
        $jenjang = $request->query('jenjang');

        $query = Sekolah::with(['opd', 'sertifikats' => function ($q) use ($period) {
            $q->where('period_id', $period->id);
        }])->whereHas('levelSubmissions', function ($q) use ($period) {
            $q->where('period_id', $period->id)
              ->where('status', 'verified');
        });

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('npsn', 'like', "%{$search}%");
            });
        }
        
        if ($opdId) {
            $query->where('opd_id', $opdId);
        }
        
        if ($jenjang) {
            $query->where('jenjang', $jenjang);
        }

        $sekolahs = $query->paginate($request->limit ?? 10);

        // Map to include certificate status
        $data = collect($sekolahs->items())->map(function ($s) {
            $sertifikat = $s->sertifikats->first();
            return [
                'id' => $s->id,
                'npsn' => $s->npsn,
                'nama' => $s->nama,
                'jenjang' => $s->jenjang,
                'opd_nama' => $s->opd ? $s->opd->nama : '-',
                'sertifikat_status' => $sertifikat ? $sertifikat->status : 'pending',
                'sertifikat_file' => $sertifikat && $sertifikat->file_path ? url(Storage::url($sertifikat->file_path)) : null,
                'nomor_surat' => $sertifikat ? $sertifikat->nomor_surat : null,
                'predikat' => $sertifikat ? $sertifikat->predikat : null,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'current_page' => $sekolahs->currentPage(),
                'data' => $data,
                'total' => $sekolahs->total(),
                'last_page' => $sekolahs->lastPage(),
            ]
        ]);
    }

    /**
     * View detailed assessment data (similar to Admin OPD verification view)
     */
    public function showDetails($sekolahId)
    {
        // No OPD check for superadmin
        $sekolah = Sekolah::with("opd")->findOrFail($sekolahId);
        $period = AssessmentPeriod::where('is_active', true)->first();
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
                        "tipe" => $p->tipe_jawaban,
                        "jawaban" => $j ? $j->jawaban_teks : "Belum Dijawab",
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
                "level_name" => $level->nama,
                "status_submission" => $submission ? $submission->status : "Belum Mulai",
                "questions" => $questions,
                "catatan_opd" => $submission ? $submission->opd_notes : null,
            ];
        });

        // Add certificate status if exists
        $sertifikat = SekolahSertifikat::where('sekolah_id', $sekolahId)
                        ->where('period_id', $periodId)->first();

        return response()->json([
            "success" => true,
            "data" => [
                "sekolah" => $sekolah,
                "levels" => $details,
                "sertifikat" => $sertifikat,
            ],
        ]);
    }

    /**
     * Upload and Issue Certificate
     */
    public function issue(Request $request, $sekolahId)
    {
        $request->validate([
            'file' => 'required|mimes:pdf,jpg,jpeg,png|max:10240',
            'nomor_surat' => 'nullable|string|max:255',
            'predikat' => 'nullable|string|max:255',
        ]);

        $period = AssessmentPeriod::where('is_active', true)->first();
        if (!$period) {
            return response()->json(['success' => false, 'message' => 'Tidak ada periode aktif.'], 404);
        }

        $path = $request->file('file')->store('sertifikat', 'public');

        DB::transaction(function () use ($path, $request, $sekolahId, $period) {
            SekolahSertifikat::updateOrCreate(
                [
                    'sekolah_id' => $sekolahId,
                    'period_id' => $period->id,
                ],
                [
                    'nomor_surat' => $request->nomor_surat,
                    'predikat' => $request->predikat,
                    'file_path' => $path,
                    'is_auto' => false,
                    'status' => 'published',
                    'published_at' => now(),
                    'catatan_superadmin' => null,
                ]
            );

            // Audit
            AuditLog::create([
                'user_id' => auth()->id(),
                'action' => 'ISSUE_CERTIFICATE',
                'auditable_type' => Sekolah::class,
                'auditable_id' => $sekolahId,
                'details' => "Superadmin menerbitkan sertifikat untuk sekolah ID {$sekolahId}",
                'ip_address' => request()->ip(),
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Sertifikat berhasil diterbitkan.',
            'url' => url(Storage::url($path))
        ]);
    }

    /**
     * Reject Certificate
     */
    public function reject(Request $request, $sekolahId)
    {
        $request->validate([
            'catatan' => 'required|string',
        ]);

        $period = AssessmentPeriod::where('is_active', true)->first();
        if (!$period) {
            return response()->json(['success' => false, 'message' => 'Tidak ada periode aktif.'], 404);
        }

        DB::transaction(function () use ($request, $sekolahId, $period) {
            // Register rejection in SekolahSertifikat
            $sertifikat = SekolahSertifikat::updateOrCreate(
                [
                    'sekolah_id' => $sekolahId,
                    'period_id' => $period->id,
                ],
                [
                    'status' => 'rejected',
                    'catatan_superadmin' => $request->catatan,
                    'is_auto' => false,
                ]
            );

            // Also revert all ALL verified level submissions to 'draft' OR keep them but mark rejected?
            // "kembalikan paksa status verifikasi sekolah tersebut jadi mentah (draft) lagi supaya Admin OPD / Sekolah harus memperbaikinya dari awal dan disubmit ulang?"
            // We will revert verified submissions to draft so OPD/School can fix them.
            LevelSubmission::where('sekolah_id', $sekolahId)
                ->where('period_id', $period->id)
                ->where('status', 'verified')
                ->update([
                    'status' => 'draft',
                    'opd_notes' => "Ditolak oleh Superadmin: " . $request->catatan,
                ]);

            AuditLog::create([
                'user_id' => auth()->id(),
                'action' => 'REJECT_CERTIFICATE',
                'auditable_type' => SekolahSertifikat::class,
                'auditable_id' => $sertifikat->id,
                'details' => "Superadmin menolak sertifikat untuk sekolah {$sekolahId} dgn catatan: {$request->catatan}",
                'ip_address' => request()->ip(),
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Sertifikat dan verifikasi sekolah ditolak. Sekolah dikembalikan ke status draft.',
        ]);
    }
}

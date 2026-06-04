<?php

namespace App\Http\Controllers\API\Sekolah;

use App\Http\Controllers\Controller;
use App\Http\Resources\API\LevelResource;
use App\Http\Resources\API\PertanyaanResource;
use App\Models\Level;
use App\Models\Pertanyaan;
use App\Models\Jawaban;
use App\Models\LevelSubmission;
use App\Services\AssessmentService;
use App\Services\FileValidationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class AssessmentController extends Controller
{
    protected $service;

    public function __construct(AssessmentService $service)
    {
        $this->service = $service;
    }

    /**
     * List all levels with status and progress for the school.
     */
    public function index()
    {
        $period = $this->service->getActivePeriod();
        if (!$period) {
            return response()->json(
                [
                    "success" => false,
                    "message" => "Tidak ada periode assessment aktif.",
                ],
                404,
            );
        }

        $sekolahId = auth()->user()->sekolah_id;
        $levels = Level::where("period_id", $period->id)
            ->orderBy("urutan")
            ->get();

        $data = $levels->map(function ($level) use ($sekolahId, $period) {
            return [
                "id" => $level->id,
                "nama" => $level->nama,
                "urutan" => $level->urutan,
                "status" => $this->service->getLevelStatus(
                    $level,
                    $sekolahId,
                    $period->id,
                ),
                "progress" => $this->service->calculateProgress(
                    $level,
                    $sekolahId,
                    $period->id,
                ),
            ];
        });

        return response()->json([
            "success" => true,
            "message" => "Daftar level berhasil diambil.",
            "data" => $data,
            "period" => [
                "id" => $period->id,
                "nama" => $period->nama,
                "tanggal_mulai" => $period->tanggal_mulai->toDateString(),
                "tanggal_selesai" => $period->tanggal_selesai->toDateString(),
                "is_deadline_passed" => $this->service->isDeadlinePassed(),
            ]
        ]);
    }

    /**
     * Get questions and school's answers for a level.
     */
    public function show($id)
    {
        $level = Level::findOrFail($id);
        $sekolahId = auth()->user()->sekolah_id;
        $period = $this->service->getActivePeriod();

        $pertanyaans = Pertanyaan::where("level_id", $id)
            ->with([
                "pilihanJawabans",
                "jawabans" => function ($query) use ($sekolahId, $period) {
                    $query
                        ->where("sekolah_id", $sekolahId)
                        ->where("period_id", $period->id);
                },
            ])
            ->orderBy("urutan")
            ->get()
            ->map(function ($p) {
                // Map teks_pertanyaan to pertanyaan for frontend compatibility
                $arr = $p->toArray();
                $arr["pertanyaan"] = $p->teks_pertanyaan;
                return $arr;
            });

        return response()->json([
            "success" => true,
            "message" => "Daftar pertanyaan berhasil diambil.",
            "data" => $pertanyaans,
            "pertanyaans" => $pertanyaans, // Also add as 'pertanyaans' for backwards compatibility
            "level_status" => $this->service->getLevelStatus(
                $level,
                $sekolahId,
                $period->id,
            ),
        ]);
    }

    /**
     * Batch save/update answers for a level.
     */
    public function store(Request $request, $id)
    {
        $level = Level::findOrFail($id);
        $sekolahId = auth()->user()->sekolah_id;
        $period = $this->service->getActivePeriod();

        // Hanya blokir jika sudah verified oleh admin - status final & submitted masih bisa di-edit
        $currentStatus = $this->service->getLevelStatus(
            $level,
            $sekolahId,
            $period->id,
        );
        if ($currentStatus === "verified") {
            return response()->json(
                [
                    "success" => false,
                    "message" =>
                        "Level ini sudah diverifikasi oleh admin dan tidak dapat diubah.",
                ],
                403,
            );
        }

        // Cek deadline
        if ($this->service->isDeadlinePassed()) {
            return response()->json(
                [
                    "success" => false,
                    "message" => "Batas waktu assessment telah berakhir (" . $period->tanggal_selesai->format('d/m/Y') . "). Anda tidak dapat lagi menyimpan jawaban.",
                ],
                403,
            );
        }

        // Support both legacy fields and new frontend format (memenuhi + bukti_links)
        $request->validate([
            "jawabans" => "required|array",
            "jawabans.*.pertanyaan_id" => "required|exists:pertanyaans,id",
            "jawabans.*.memenuhi" => "nullable|boolean",
            "jawabans.*.bukti_links" => "nullable|array",
            "jawabans.*.jawaban_teks" => "nullable|string",
            "jawabans.*.nilai" => "nullable|integer",
            "jawabans.*.file_path" => "nullable|string",
        ]);

        DB::transaction(function () use ($request, $sekolahId, $period, $id) {
            foreach ($request->jawabans as $j) {
                // Map frontend format to DB columns
                $memenuhiVal = $j["memenuhi"] ?? null;
                $buktiLinks = $j["bukti_links"] ?? [];

                // jawaban_teks: 'ya' / 'tidak' / null from memenuhi boolean
                $jawabanTeks = null;
                if (
                    $memenuhiVal === true ||
                    $memenuhiVal === 1 ||
                    $memenuhiVal === "true" ||
                    $memenuhiVal === "1"
                ) {
                    $jawabanTeks = "ya";
                } elseif (
                    $memenuhiVal === false ||
                    $memenuhiVal === 0 ||
                    $memenuhiVal === "false" ||
                    $memenuhiVal === "0"
                ) {
                    $jawabanTeks = "tidak";
                } elseif (!empty($j["jawaban_teks"])) {
                    $jawabanTeks = $j["jawaban_teks"];
                }

                // Nilai: 1 jika memenuhi, 0 jika tidak
                $nilai =
                    $memenuhiVal === true ||
                    $memenuhiVal === 1 ||
                    $memenuhiVal === "true" ||
                    $memenuhiVal === "1"
                        ? 1
                        : (isset($j["nilai"])
                            ? $j["nilai"]
                            : 0);

                // file_path: simpan links sebagai JSON string, atau gunakan file_path lama
                $filePath = !empty($buktiLinks)
                    ? json_encode($buktiLinks)
                    : $j["file_path"] ?? null;

                Jawaban::updateOrCreate(
                    [
                        "sekolah_id" => $sekolahId,
                        "pertanyaan_id" => $j["pertanyaan_id"],
                        "period_id" => $period->id,
                    ],
                    [
                        "jawaban_teks" => $jawabanTeks,
                        "nilai" => $nilai,
                        "file_path" => $filePath,
                        "is_final" => false,
                    ],
                );
            }

            // Simpan/update submission sebagai 'submitted' (data sudah dikirim, tapi masih bisa direvisi)
            LevelSubmission::updateOrCreate(
                [
                    "sekolah_id" => $sekolahId,
                    "level_id" => $id,
                    "period_id" => $period->id,
                ],
                [
                    "status" => "submitted",
                    "submitted_at" => now(),
                ],
            );
        });

        return response()->json([
            "success" => true,
            "message" => "Jawaban berhasil disimpan.",
            "data" => null,
        ]);
    }

    /**
     * Submit level as final.
     */
    public function submitFinal($id)
    {
        $level = Level::findOrFail($id);
        $sekolahId = auth()->user()->sekolah_id;
        $period = $this->service->getActivePeriod();

        if (!$period) {
            return response()->json(
                ["success" => false, "message" => "Tidak ada periode aktif."],
                404,
            );
        }

        // Validasi: hanya cek apakah semua pertanyaan sudah ada jawabannya (tidak wajib ada bukti)
        $allPertanyaanIds = $level->pertanyaans()->pluck("id");
        $answeredIds = Jawaban::where("sekolah_id", $sekolahId)
            ->where("period_id", $period->id)
            ->whereIn("pertanyaan_id", $allPertanyaanIds)
            ->whereNotNull("jawaban_teks")
            ->pluck("pertanyaan_id");

        if ($allPertanyaanIds->count() > $answeredIds->count()) {
            return response()->json(
                [
                    "success" => false,
                    "message" =>
                        "Semua pertanyaan harus dijawab terlebih dahulu sebelum submit final.",
                ],
                422,
            );
        }

        // Blokir jika sudah diverifikasi admin
        $existing = LevelSubmission::where("sekolah_id", $sekolahId)
            ->where("level_id", $id)
            ->where("period_id", $period->id)
            ->first();

        if ($existing && $existing->status === "verified") {
            return response()->json(
                [
                    "success" => false,
                    "message" => "Level sudah diverifikasi oleh admin.",
                ],
                403,
            );
        }

        // Cek deadline
        if ($this->service->isDeadlinePassed()) {
            return response()->json(
                [
                    "success" => false,
                    "message" => "Batas waktu assessment telah berakhir (" . $period->tanggal_selesai->format('d/m/Y') . "). Anda tidak dapat lagi mensubmit level.",
                ],
                403,
            );
        }

        DB::transaction(function () use (
            $sekolahId,
            $id,
            $period,
            $allPertanyaanIds,
        ) {
            $totalSkor = Jawaban::where("sekolah_id", $sekolahId)
                ->where("period_id", $period->id)
                ->whereIn("pertanyaan_id", $allPertanyaanIds)
                ->sum("nilai");

            LevelSubmission::updateOrCreate(
                [
                    "sekolah_id" => $sekolahId,
                    "level_id" => $id,
                    "period_id" => $period->id,
                ],
                [
                    "status" => "final",
                    "submitted_at" => now(),
                    "finalized_at" => now(),
                    "total_skor" => $totalSkor,
                ],
            );

            Jawaban::where("sekolah_id", $sekolahId)
                ->where("period_id", $period->id)
                ->whereIn("pertanyaan_id", $allPertanyaanIds)
                ->update(["is_final" => true, "is_rejected" => false, "submitted_at" => now()]);
        });

        return response()->json([
            "success" => true,
            "message" => "Jawaban berhasil dikunci secara permanen.",
            "data" => null,
        ]);
    }

    /**
     * Handle file upload.
     */
    public function upload(Request $request)
    {
        $request->validate([
            "file" => "required|file|mimes:jpg,png,pdf|max:5120",
        ]);

        // Validasi magic bytes
        $fileValidator = new FileValidationService();
        $validation = $fileValidator->validate(
            $request->file("file"),
            ['jpg', 'png', 'pdf'],
            5120 // 5MB in KB
        );

        if (!$validation['valid']) {
            return response()->json([
                "success" => false,
                "message" => "File validation failed: " . $validation['error'],
                "data" => null,
            ], 422);
        }

        $path = $request->file("file")->store("bukti", "public");

        return response()->json([
            "success" => true,
            "message" => "File berhasil diunggah.",
            "data" => [
                "path" => $path,
                "url" => Storage::url($path),
            ],
        ]);
    }

    /**
     * Get school profile and assessment summary.
     */
    public function profile()
    {
        $user = auth()->user();
        $sekolah = \App\Models\Sekolah::with("opd")->findOrFail(
            $user->sekolah_id,
        );
        $period = $this->service->getActivePeriod();

        $stats = $period
            ? $this->service->getSchoolStats($sekolah->id, $period->id)
            : [
                "kategori_selesai" => "0 / 0",
                "indikator_terisi" => "0 / 0",
                "progress" => 0,
                "is_verified" => false,
            ];

        return response()->json([
            "success" => true,
            "data" => [
                "sekolah" => $sekolah,
                "stats" => $stats,
            ],
        ]);
    }

    /**
     * Update school profile information.
     */
    public function updateProfile(Request $request)
    {
        $user = auth()->user();
        $sekolah = \App\Models\Sekolah::findOrFail($user->sekolah_id);

        $request->validate([
            "alamat" => "nullable|string",
            "telepon" => "nullable|string",
            "email_sekolah" => "nullable|email",
            "akreditasi" => "nullable|string|max:2",
            "kepala_sekolah" => "nullable|string",
        ]);

        $sekolah->update(
            $request->only([
                "alamat",
                "telepon",
                "email_sekolah",
                "akreditasi",
                "kepala_sekolah",
            ]),
        );

        return response()->json([
            "success" => true,
            "message" => "Profil sekolah berhasil diperbarui.",
            "data" => $sekolah,
        ]);
    }
}

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
            return response()->json(['success' => false, 'message' => 'Tidak ada periode assessment aktif.'], 404);
        }

        $sekolahId = auth()->user()->sekolah_id;
        $levels = Level::where('period_id', $period->id)->orderBy('urutan')->get();

        $data = $levels->map(function ($level) use ($sekolahId, $period) {
            return [
                'id' => $level->id,
                'nama' => $level->nama,
                'urutan' => $level->urutan,
                'status' => $this->service->getLevelStatus($level, $sekolahId, $period->id),
                'progress' => $this->service->calculateProgress($level, $sekolahId, $period->id),
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'Daftar level berhasil diambil.',
            'data' => $data
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

        $pertanyaans = Pertanyaan::where('level_id', $id)
            ->with(['pilihanJawabans', 'jawabans' => function ($query) use ($sekolahId, $period) {
                $query->where('sekolah_id', $sekolahId)->where('period_id', $period->id);
            }])
            ->orderBy('urutan')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar pertanyaan berhasil diambil.',
            'data' => $pertanyaans,
            'level_status' => $this->service->getLevelStatus($level, $sekolahId, $period->id)
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

        $status = $this->service->getLevelStatus($level, $sekolahId, $period->id);
        if ($status === 'locked' || $status === 'final' || $status === 'verified') {
            return response()->json([
                'success' => false, 
                'message' => 'Level ini terkunci atau sudah dalam status final/verified.'
            ], 403);
        }

        $request->validate([
            'jawabans' => 'required|array',
            'jawabans.*.pertanyaan_id' => 'required|exists:pertanyaans,id',
            'jawabans.*.jawaban_teks' => 'nullable|string',
            'jawabans.*.nilai' => 'nullable|integer',
            'jawabans.*.file_path' => 'nullable|string',
        ]);

        DB::transaction(function () use ($request, $sekolahId, $period, $id) {
            foreach ($request->jawabans as $j) {
                Jawaban::updateOrCreate(
                    [
                        'sekolah_id' => $sekolahId,
                        'pertanyaan_id' => $j['pertanyaan_id'],
                        'period_id' => $period->id,
                    ],
                    [
                        'jawaban_teks' => $j['jawaban_teks'] ?? null,
                        'nilai' => $j['nilai'] ?? 0,
                        'file_path' => $j['file_path'] ?? null,
                        'is_final' => false,
                    ]
                );
            }

            LevelSubmission::updateOrCreate(
                [
                    'sekolah_id' => $sekolahId,
                    'level_id' => $id,
                    'period_id' => $period->id,
                ],
                ['status' => 'draft']
            );
        });

        return response()->json([
            'success' => true,
            'message' => 'Jawaban berhasil disimpan sebagai draft.',
            'data' => null
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

        // Validation: All required questions must be answered
        $requiredIds = $level->pertanyaans()->where('is_required', true)->pluck('id');
        $answeredIds = Jawaban::where('sekolah_id', $sekolahId)
            ->where('period_id', $period->id)
            ->whereIn('pertanyaan_id', $requiredIds)
            ->where(function ($q) {
                $q->whereNotNull('jawaban_teks')->orWhereNotNull('file_path');
            })
            ->pluck('pertanyaan_id');

        if ($requiredIds->count() > $answeredIds->count()) {
            return response()->json([
                'success' => false,
                'message' => 'Harap lengkapi semua pertanyaan wajib sebelum submit final.'
            ], 422);
        }

        DB::transaction(function () use ($sekolahId, $id, $period) {
            $submission = LevelSubmission::where('sekolah_id', $sekolahId)
                ->where('level_id', $id)
                ->where('period_id', $period->id)
                ->first();

            $totalSkor = Jawaban::where('sekolah_id', $sekolahId)
                ->where('period_id', $period->id)
                ->whereIn('pertanyaan_id', Level::find($id)->pertanyaans()->pluck('id'))
                ->sum('nilai');

            $submission->update([
                'status' => 'final',
                'submitted_at' => now(),
                'finalized_at' => now(),
                'total_skor' => $totalSkor
            ]);

            Jawaban::where('sekolah_id', $sekolahId)
                ->where('period_id', $period->id)
                ->whereIn('pertanyaan_id', Level::find($id)->pertanyaans()->pluck('id'))
                ->update(['is_final' => true, 'submitted_at' => now()]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Assessment Level berhasil di-submit secara permanen.',
            'data' => null
        ]);
    }

    /**
     * Handle file upload.
     */
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:jpg,png,pdf|max:5120',
        ]);

        $path = $request->file('file')->store('bukti', 'public');

        return response()->json([
            'success' => true,
            'message' => 'File berhasil diunggah.',
            'data' => [
                'path' => $path,
                'url' => Storage::url($path)
            ]
        ]);
    }

    /**
     * Get school profile and assessment summary.
     */
    public function profile()
    {
        $user = auth()->user();
        $sekolah = \App\Models\Sekolah::with('opd')->findOrFail($user->sekolah_id);
        $period = $this->service->getActivePeriod();
        
        $stats = $period ? $this->service->getSchoolStats($sekolah->id, $period->id) : [
            'kategori_selesai' => '0 / 0',
            'indikator_terisi' => '0 / 0',
            'progress' => 0,
            'is_verified' => false
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'sekolah' => $sekolah,
                'stats' => $stats
            ]
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
            'alamat' => 'nullable|string',
            'telepon' => 'nullable|string',
            'email_sekolah' => 'nullable|email',
            'akreditasi' => 'nullable|string|max:2',
            'kepala_sekolah' => 'nullable|string',
        ]);

        $sekolah->update($request->only([
            'alamat', 'telepon', 'email_sekolah', 'akreditasi', 'kepala_sekolah'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Profil sekolah berhasil diperbarui.',
            'data' => $sekolah
        ]);
    }
}

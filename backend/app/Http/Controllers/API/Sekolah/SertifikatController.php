<?php

namespace App\Http\Controllers\API\Sekolah;

use App\Http\Controllers\Controller;
use App\Models\SekolahSertifikat;
use App\Models\SertifikatSetting;
use App\Models\LevelSubmission;
use App\Models\AssessmentPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SertifikatController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $sekolah = $user->sekolah;

        if (!$sekolah) {
            return response()->json(['success' => false, 'message' => 'User tidak terkait dengan sekolah manapun.'], 403);
        }

        $activePeriod = AssessmentPeriod::where('is_active', true)->first();
        if (!$activePeriod) {
            return response()->json(['success' => false, 'message' => 'Tidak ada periode aktif.'], 404);
        }

        // Check verification status
        // School is verified if its highest submitted level is verified
        $submissions = LevelSubmission::where('sekolah_id', $sekolah->id)
            ->where('period_id', $activePeriod->id)
            ->get();
        
        $isVerified = false;
        $predikat = 'standar';
        $verifiedAt = null;
        $verifierName = 'Admin';
        
        if ($submissions->isNotEmpty() && $submissions->every(fn($sub) => $sub->status === 'verified')) {
            $isVerified = true;
            $highestLevel = DB::table('levels')->whereIn('id', $submissions->pluck('level_id'))->orderBy('urutan', 'desc')->first();
            
            if ($highestLevel) {
                if ($highestLevel->urutan == 1) $predikat = 'dasar';
                elseif ($highestLevel->urutan == 2) $predikat = 'standar';
                elseif ($highestLevel->urutan == 3) $predikat = 'optimal';
                elseif ($highestLevel->urutan == 4) $predikat = 'paripurna';
            }

            $lastVerified = $submissions->sortByDesc('verified_at')->first();
            $verifiedAt = $lastVerified->verified_at;
            if ($lastVerified->verifier_id) {
                $verifier = DB::table('users')->find($lastVerified->verifier_id);
                if ($verifier) {
                    $verifierName = $verifier->name;
                }
            }
        }

        $sertifikat = SekolahSertifikat::where('sekolah_id', $sekolah->id)
            ->where('period_id', $activePeriod->id)
            ->first();

        if ($sertifikat && $sertifikat->file_path) {
            $sertifikat->file_url = url(\Illuminate\Support\Facades\Storage::url($sertifikat->file_path));
        }

        $setting = SertifikatSetting::firstOrCreate(
            ['opd_id' => $sekolah->opd_id],
            [
                'nama_penerbit' => 'Dinas Kesehatan',
                'jabatan_penandatangan' => 'Kepala Dinas Kesehatan',
                'format_nomor_surat' => 'UKS/[TAHUN]/[ID_SEKOLAH]',
                'is_auto_number' => true,
            ]
        );

        $autoNumber = str_replace(
            ['[TAHUN]', '[ID_SEKOLAH]'],
            [date('Y'), $sekolah->id],
            $setting->format_nomor_surat
        );

        return response()->json([
            'success' => true,
            'data' => [
                'is_verified' => $isVerified,
                'predikat_calc' => $predikat,
                'verified_at' => $verifiedAt,
                'verifier_name' => $verifierName,
                'setting' => $setting,
                'auto_number_preview' => $autoNumber,
                'sertifikat' => $sertifikat
            ]
        ]);
    }

    public function generate(Request $request)
    {
        $user = auth()->user();
        $sekolah = $user->sekolah;

        if (!$sekolah) {
            return response()->json(['success' => false, 'message' => 'User tidak terkait dengan sekolah manapun.'], 403);
        }

        $activePeriod = AssessmentPeriod::where('is_active', true)->first();
        if (!$activePeriod) {
            return response()->json(['success' => false, 'message' => 'Tidak ada periode aktif.'], 404);
        }

        $validated = $request->validate([
            'nomor_surat' => 'required|string|max:255',
            'predikat' => 'required|string|max:50',
            'is_auto' => 'boolean',
        ]);

        $sertifikat = SekolahSertifikat::updateOrCreate(
            [
                'sekolah_id' => $sekolah->id,
                'period_id' => $activePeriod->id,
            ],
            [
                'nomor_surat' => $validated['nomor_surat'],
                'predikat' => $validated['predikat'],
                'is_auto' => $validated['is_auto'] ?? false,
                'published_at' => now(),
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Sertifikat berhasil diterbitkan.',
            'data' => $sertifikat
        ]);
    }
}

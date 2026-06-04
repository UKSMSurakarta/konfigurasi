<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\SertifikatSetting;
use Illuminate\Http\Request;

class SertifikatSettingController extends Controller
{
    public function getSetting(Request $request)
    {
        $user = auth()->user();
        $opdId = $user->role === 'superadmin' && $request->has('opd_id') ? $request->opd_id : $user->opd_id;

        $setting = SertifikatSetting::firstOrCreate(
            ['opd_id' => $opdId],
            [
                'nama_penerbit' => 'Dinas Kesehatan',
                'jabatan_penandatangan' => 'Kepala Dinas Kesehatan',
                'format_nomor_surat' => 'UKS/[TAHUN]/[ID_SEKOLAH]',
                'is_auto_number' => true,
            ]
        );

        return response()->json([
            'success' => true,
            'data' => $setting
        ]);
    }

    public function updateSetting(Request $request)
    {
        $user = auth()->user();
        $opdId = $user->role === 'superadmin' && $request->has('opd_id') ? $request->opd_id : $user->opd_id;

        $validated = $request->validate([
            'nama_penerbit' => 'required|string|max:255',
            'jabatan_penandatangan' => 'required|string|max:255',
            'format_nomor_surat' => 'required|string|max:255',
            'is_auto_number' => 'boolean',
        ]);

        $setting = SertifikatSetting::firstOrCreate(['opd_id' => $opdId]);
        $setting->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Pengaturan sertifikat berhasil disimpan.',
            'data' => $setting
        ]);
    }
}

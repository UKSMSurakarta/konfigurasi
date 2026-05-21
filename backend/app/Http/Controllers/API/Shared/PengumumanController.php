<?php

namespace App\Http\Controllers\API\Shared;

use App\Http\Controllers\Controller;
use App\Models\Opd;
use App\Models\Pengumuman;
use App\Models\User;
use App\Notifications\PengumumanNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PengumumanController extends Controller
{
    /**
     * Daftar pengumuman yang dibuat oleh user login.
     * Superadmin melihat semua, admin hanya miliknya.
     */
    public function index()
    {
        $user = auth()->user();

        $query = Pengumuman::with(['sender', 'opd'])->latest();

        if ($user->role === 'admin') {
            $query->where('sender_id', $user->id);
        }

        $pengumumans = $query->paginate(15);

        return response()->json([
            'success' => true,
            'data'    => $pengumumans,
        ]);
    }

    /**
     * Buat pengumuman baru dan kirim notifikasi ke sekolah target.
     */
    public function store(Request $request)
    {
        $user = auth()->user();

        $rules = [
            'judul' => 'required|string|max:255',
            'isi'   => 'required|string',
        ];

        // Superadmin bisa memilih target
        if ($user->role === 'superadmin') {
            $rules['target_type'] = 'required|in:all,opd';
            $rules['opd_id']      = 'required_if:target_type,opd|nullable|exists:opds,id';
        }

        $request->validate($rules);

        DB::transaction(function () use ($request, $user) {
            // Tentukan target
            if ($user->role === 'admin') {
                $targetType = 'opd';
                $opdId      = $user->opd_id;
            } else {
                $targetType = $request->target_type;
                $opdId      = $targetType === 'opd' ? $request->opd_id : null;
            }

            // Simpan pengumuman
            $pengumuman = Pengumuman::create([
                'judul'        => $request->judul,
                'isi'          => $request->isi,
                'sender_id'    => $user->id,
                'target_type'  => $targetType,
                'opd_id'       => $opdId,
                'is_published' => true,
                'published_at' => now(),
            ]);

            // Cari user sekolah yang menjadi target
            $sekolahUsersQuery = User::where('role', 'sekolah')->where('is_active', true);

            if ($targetType === 'opd') {
                // Cari sekolah berdasarkan OPD -> user yang sekolahnya di OPD ini
                $sekolahUsersQuery->whereHas('sekolah', function ($q) use ($opdId) {
                    $q->where('opd_id', $opdId);
                });
            }
            // Jika target_type = 'all', kirim ke semua user sekolah tanpa filter

            $sekolahUsers = $sekolahUsersQuery->get();

            // Kirim notifikasi
            foreach ($sekolahUsers as $sekolahUser) {
                $sekolahUser->notify(new PengumumanNotification($pengumuman));
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Pengumuman berhasil dikirim.',
        ], 201);
    }

    /**
     * Update pengumuman (tidak mengirim ulang notifikasi).
     */
    public function update(Request $request, $id)
    {
        $user        = auth()->user();
        $pengumuman  = Pengumuman::findOrFail($id);

        // Admin hanya bisa edit miliknya sendiri
        if ($user->role === 'admin' && $pengumuman->sender_id !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak.'], 403);
        }

        $request->validate([
            'judul' => 'sometimes|string|max:255',
            'isi'   => 'sometimes|string',
        ]);

        $pengumuman->update($request->only(['judul', 'isi']));

        return response()->json([
            'success' => true,
            'message' => 'Pengumuman berhasil diperbarui.',
            'data'    => $pengumuman,
        ]);
    }

    /**
     * Hapus pengumuman.
     */
    public function destroy($id)
    {
        $user       = auth()->user();
        $pengumuman = Pengumuman::findOrFail($id);

        if ($user->role === 'admin' && $pengumuman->sender_id !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak.'], 403);
        }

        $pengumuman->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pengumuman berhasil dihapus.',
        ]);
    }

    /**
     * Endpoint tambahan: daftar OPD (untuk dropdown di form superadmin).
     */
    public function opdList()
    {
        $opds = Opd::orderBy('nama')->get(['id', 'nama']);
        return response()->json(['success' => true, 'data' => $opds]);
    }
}

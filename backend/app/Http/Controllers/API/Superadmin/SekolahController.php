<?php

namespace App\Http\Controllers\API\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\Sekolah;
use Illuminate\Http\Request;

class SekolahController extends Controller
{
    public function index(Request $request)
    {
        $query = Sekolah::with('opd');

        if ($request->opd_id) $query->where('opd_id', $request->opd_id);
        if ($request->jenjang) $query->where('jenjang', $request->jenjang);
        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('nama', 'like', '%' . $request->search . '%')
                  ->orWhere('npsn', 'like', '%' . $request->search . '%');
            });
        }

        return response()->json([
            'success' => true,
            'data' => $query->paginate($request->limit ?? 10)
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'npsn' => 'required|string|unique:sekolahs,npsn',
            'jenjang' => 'required|in:TK,SD,SMP,SMA,SMK',
            'opd_id' => 'required|exists:opds,id',
            'alamat' => 'nullable|string',
            'kepala_sekolah' => 'nullable|string',
        ]);

        $sekolah = Sekolah::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Sekolah berhasil ditambahkan.',
            'data' => $sekolah
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $sekolah = Sekolah::findOrFail($id);
        
        $request->validate([
            'nama' => 'sometimes|string|max:255',
            'npsn' => 'sometimes|string|unique:sekolahs,npsn,' . $id,
            'jenjang' => 'sometimes|in:TK,SD,SMP,SMA,SMK',
            'opd_id' => 'sometimes|exists:opds,id',
        ]);

        $sekolah->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Data sekolah berhasil diperbarui.',
            'data' => $sekolah
        ]);
    }

    public function destroy($id)
    {
        $sekolah = Sekolah::findOrFail($id);
        
        // Check if school has users or submissions
        if ($sekolah->users()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak dapat menghapus sekolah yang masih memiliki akun user.'
            ], 422);
        }

        $sekolah->delete();

        return response()->json([
            'success' => true,
            'message' => 'Sekolah berhasil dihapus.'
        ]);
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv|max:2048'
        ]);

        // TODO: Implement Excel Import using Maatwebsite\Excel
        
        return response()->json([
            'success' => true,
            'message' => 'Fitur import sedang diproses.'
        ]);
    }
}

<?php

namespace App\Http\Controllers\API\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\Opd;
use Illuminate\Http\Request;

class OpdController extends Controller
{
    public function index(Request $request)
    {
        $opds = Opd::withCount(['sekolahs', 'users'])
            ->when($request->search, function($q) use ($request) {
                $q->where('nama', 'like', '%' . $request->search . '%')
                  ->orWhere('kode', 'like', '%' . $request->search . '%');
            })
            ->get();

        return response()->json([
            'success' => true,
            'data' => $opds
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'kode' => 'required|string|unique:opds,kode',
            'alamat' => 'nullable|string',
        ]);

        $opd = Opd::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'OPD berhasil ditambahkan.',
            'data' => $opd
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $opd = Opd::findOrFail($id);
        
        $request->validate([
            'nama' => 'sometimes|string|max:255',
            'kode' => 'sometimes|string|unique:opds,kode,' . $id,
        ]);

        $opd->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Data OPD berhasil diperbarui.',
            'data' => $opd
        ]);
    }

    public function destroy($id)
    {
        $opd = Opd::findOrFail($id);

        if ($opd->sekolahs()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak dapat menghapus OPD yang masih memiliki data sekolah.'
            ], 422);
        }

        $opd->delete();

        return response()->json([
            'success' => true,
            'message' => 'OPD berhasil dihapus.'
        ]);
    }
}

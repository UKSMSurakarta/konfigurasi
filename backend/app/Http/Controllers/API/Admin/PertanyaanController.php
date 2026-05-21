<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\API\PertanyaanResource;
use App\Models\Level;
use App\Models\Pertanyaan;
use App\Models\PilihanJawaban;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PertanyaanController extends Controller
{
    /**
     * List questions for a specific level.
     */
    public function index($levelId)
    {
        $pertanyaans = Pertanyaan::where('level_id', $levelId)
            ->with('pilihanJawabans')
            ->orderBy('urutan')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar pertanyaan berhasil diambil.',
            'data' => PertanyaanResource::collection($pertanyaans)
        ]);
    }

    /**
     * Store a new question for a level.
     */
    public function store(Request $request, $levelId)
    {
        if (auth()->user()->role !== 'superadmin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $request->validate([
            'teks_pertanyaan' => 'required|string',
            'tipe_jawaban' => 'required|in:ya_tidak,pilihan_ganda,isian,upload',
            'bobot' => 'required|integer',
            'urutan' => 'required|integer',
            'is_required' => 'boolean',
            'pilihan_jawabans' => 'nullable|array',
            'pilihan_jawabans.*.teks' => 'required_if:tipe_jawaban,pilihan_ganda|string',
            'pilihan_jawabans.*.nilai' => 'required_if:tipe_jawaban,pilihan_ganda|integer',
        ]);

        return DB::transaction(function () use ($request, $levelId) {
            $pertanyaan = Pertanyaan::create([
                'level_id' => $levelId,
                'teks_pertanyaan' => $request->teks_pertanyaan,
                'tipe_jawaban' => $request->tipe_jawaban,
                'bobot' => $request->bobot,
                'urutan' => $request->urutan,
                'is_required' => $request->is_required ?? true,
            ]);

            if ($request->tipe_jawaban === 'pilihan_ganda' && $request->has('pilihan_jawabans')) {
                foreach ($request->pilihan_jawabans as $pilihan) {
                    $pertanyaan->pilihanJawabans()->create($pilihan);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Pertanyaan berhasil ditambahkan.',
                'data' => new PertanyaanResource($pertanyaan->load('pilihanJawabans'))
            ], 201);
        });
    }

    /**
     * Update a question.
     */
    public function update(Request $request, $id)
    {
        if (auth()->user()->role !== 'superadmin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $pertanyaan = Pertanyaan::findOrFail($id);

        $request->validate([
            'teks_pertanyaan' => 'sometimes|string',
            'bobot' => 'sometimes|integer',
            'urutan' => 'sometimes|integer',
            'is_required' => 'boolean',
        ]);

        $pertanyaan->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Pertanyaan berhasil diperbarui.',
            'data' => new PertanyaanResource($pertanyaan)
        ]);
    }

    /**
     * Remove a question.
     */
    public function destroy($id)
    {
        if (auth()->user()->role !== 'superadmin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $pertanyaan = Pertanyaan::findOrFail($id);

        if ($pertanyaan->jawabans()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Pertanyaan tidak dapat dihapus karena sudah memiliki jawaban dari sekolah.'
            ], 422);
        }

        $pertanyaan->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pertanyaan berhasil dihapus.',
            'data' => null
        ]);
    }

    /**
     * Reorder questions (bulk update).
     */
    public function reorder(Request $request)
    {
        if (auth()->user()->role !== 'superadmin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $request->validate([
            'orders' => 'required|array',
            'orders.*.id' => 'required|exists:pertanyaans,id',
            'orders.*.urutan' => 'required|integer',
        ]);

        DB::transaction(function () use ($request) {
            foreach ($request->orders as $order) {
                Pertanyaan::where('id', $order['id'])->update(['urutan' => $order['urutan']]);
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Urutan pertanyaan berhasil diperbarui.',
            'data' => null
        ]);
    }
}

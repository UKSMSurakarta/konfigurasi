<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\API\LevelResource;
use App\Models\Level;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LevelController extends Controller
{
    /**
     * Display a listing of the levels.
     */
    public function index()
    {
        $levels = Level::withCount('pertanyaans')->orderBy('urutan')->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar level berhasil diambil.',
            'data' => LevelResource::collection($levels)
        ]);
    }

    /**
     * Store a newly created level.
     */
    public function store(Request $request)
    {
        // Only superadmin can create (based on user request description for management)
        if (auth()->user()->role !== 'superadmin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $request->validate([
            'nama' => 'required|string|max:255',
            'urutan' => 'required|integer',
            'period_id' => 'required|exists:assessment_periods,id',
            'deskripsi' => 'nullable|string',
        ]);

        $level = Level::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Level berhasil dibuat.',
            'data' => new LevelResource($level)
        ], 201);
    }

    /**
     * Update the specified level.
     */
    public function update(Request $request, $id)
    {
        if (auth()->user()->role !== 'superadmin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $level = Level::findOrFail($id);
        
        $request->validate([
            'nama' => 'sometimes|string|max:255',
            'urutan' => 'sometimes|integer',
            'deskripsi' => 'nullable|string',
        ]);

        $level->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Level berhasil diperbarui.',
            'data' => new LevelResource($level)
        ]);
    }

    /**
     * Remove the specified level.
     */
    public function destroy($id)
    {
        if (auth()->user()->role !== 'superadmin') {
            return response()->json(['success' => false, 'message' => 'Hanya Superadmin yang dapat menghapus level.'], 403);
        }

        $level = Level::findOrFail($id);

        // Check if level has answers/submissions
        if ($level->submissions()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Level tidak dapat dihapus karena sudah memiliki data pengisian dari sekolah.'
            ], 422);
        }

        $level->delete();

        return response()->json([
            'success' => true,
            'message' => 'Level berhasil dihapus.',
            'data' => null
        ]);
    }

    /**
     * Toggle level activation status.
     */
    public function toggle($id)
    {
        if (auth()->user()->role !== 'superadmin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $level = Level::findOrFail($id);
        $level->is_active = !$level->is_active;
        $level->save();

        return response()->json([
            'success' => true,
            'message' => 'Status level berhasil diubah.',
            'data' => new LevelResource($level)
        ]);
    }
}

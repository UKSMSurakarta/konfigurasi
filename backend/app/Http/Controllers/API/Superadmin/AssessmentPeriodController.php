<?php

namespace App\Http\Controllers\API\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\AssessmentPeriod;
use Illuminate\Http\Request;

class AssessmentPeriodController extends Controller
{
    public function index()
    {
        $periods = AssessmentPeriod::orderBy('tahun', 'desc')->get();
        
        return response()->json([
            'success' => true,
            'data' => $periods
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'tahun' => 'required|integer',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'required|date|after_or_equal:tanggal_mulai',
            'is_active' => 'boolean',
        ]);

        // If this new period is active, deactivate others
        if ($request->is_active) {
            AssessmentPeriod::where('is_active', true)->update(['is_active' => false]);
        }

        $period = AssessmentPeriod::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Periode assessment berhasil dibuat.',
            'data' => $period
        ], 201);
    }

    public function show($id)
    {
        $period = AssessmentPeriod::findOrFail($id);
        return response()->json([
            'success' => true,
            'data' => $period
        ]);
    }

    public function update(Request $request, $id)
    {
        $period = AssessmentPeriod::findOrFail($id);

        $request->validate([
            'nama' => 'sometimes|string|max:255',
            'tahun' => 'sometimes|integer',
            'tanggal_mulai' => 'sometimes|date',
            'tanggal_selesai' => 'sometimes|date|after_or_equal:tanggal_mulai',
            'is_active' => 'boolean',
        ]);

        if ($request->has('is_active') && $request->is_active && !$period->is_active) {
            AssessmentPeriod::where('is_active', true)->update(['is_active' => false]);
        }

        $period->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Periode assessment berhasil diperbarui.',
            'data' => $period
        ]);
    }

    public function destroy($id)
    {
        $period = AssessmentPeriod::findOrFail($id);
        
        // Optionally check for dependencies (e.g. if it has submissions)
        
        $period->delete();

        return response()->json([
            'success' => true,
            'message' => 'Periode assessment berhasil dihapus.'
        ]);
    }

    public function toggleActive($id)
    {
        $period = AssessmentPeriod::findOrFail($id);
        
        if (!$period->is_active) {
            AssessmentPeriod::where('is_active', true)->update(['is_active' => false]);
            $period->is_active = true;
        } else {
            $period->is_active = false;
        }
        
        $period->save();

        return response()->json([
            'success' => true,
            'message' => 'Status periode berhasil diubah.',
            'data' => $period
        ]);
    }
}

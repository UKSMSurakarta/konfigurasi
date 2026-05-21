<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Sekolah;
use Illuminate\Http\Request;

class SekolahController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $opdId = auth()->user()->opd_id;
        
        $query = Sekolah::where('opd_id', $opdId);

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('nama', 'like', "%{$request->search}%")
                  ->orWhere('npsn', 'like', "%{$request->search}%");
            });
        }

        if ($request->jenjang) {
            $query->where('jenjang', $request->jenjang);
        }

        $sekolahs = $query->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $sekolahs
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $opdId = auth()->user()->opd_id;
        $sekolah = Sekolah::where('opd_id', $opdId)->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $sekolah
        ]);
    }
}

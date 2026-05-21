<?php

namespace App\Http\Controllers\API\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\API\KontenResource;
use App\Models\Konten;
use App\Models\Sekolah;
use App\Models\LevelSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PublicController extends Controller
{
    /**
     * Get published news.
     */
    public function berita(Request $request)
    {
        $berita = Konten::where('tipe', 'berita')
            ->where('is_published', true)
            ->orderBy('published_at', 'desc')
            ->paginate($request->limit ?? 6);

        return KontenResource::collection($berita);
    }

    /**
     * Get news detail by slug.
     */
    public function detailBerita($slug)
    {
        $konten = Konten::where('slug', $slug)
            ->where('is_published', true)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => new KontenResource($konten)
        ]);
    }

    /**
     * Get published announcements.
     */
    public function pengumuman()
    {
        $data = Konten::where('tipe', 'pengumuman')
            ->where('is_published', true)
            ->orderBy('published_at', 'desc')
            ->get();

        return KontenResource::collection($data);
    }

    /**
     * Get upcoming agendas.
     */
    public function agenda()
    {
        $data = Konten::where('tipe', 'agenda')
            ->where('is_published', true)
            ->orderBy('created_at', 'desc')
            ->get();

        return KontenResource::collection($data);
    }

    /**
     * Get gallery.
     */
    public function galeri()
    {
        $data = Konten::where('tipe', 'galeri')
            ->where('is_published', true)
            ->orderBy('created_at', 'desc')
            ->get();

        return KontenResource::collection($data);
    }

    /**
     * Ranking Sekolah berdasarkan total skor level yang sudah final.
     */
    public function rankingSekolah()
    {
        $ranking = DB::table('level_submissions')
            ->join('sekolahs', 'level_submissions.sekolah_id', '=', 'sekolahs.id')
            ->select('sekolahs.nama', 'sekolahs.jenjang', DB::raw('SUM(total_skor) as total_skor'))
            ->where('level_submissions.status', 'final')
            ->groupBy('sekolahs.id', 'sekolahs.nama', 'sekolahs.jenjang')
            ->orderBy('total_skor', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $ranking
        ]);
    }

    /**
     * Statistik Umum untuk Dashboard Publik.
     */
    public function statistik()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'total_sekolah' => Sekolah::count(),
                'total_berita' => Konten::where('tipe', 'berita')->count(),
                'sekolah_final' => LevelSubmission::where('status', 'final')->distinct('sekolah_id')->count(),
                'jenjang_dist' => Sekolah::select('jenjang', DB::raw('count(*) as count'))->groupBy('jenjang')->get()
            ]
        ]);
    }
}

<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\API\KontenResource;
use App\Models\Konten;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class KontenController extends Controller
{
    /**
     * List content with pagination and filters.
     */
    public function index(Request $request)
    {
        $query = Konten::with("author");

        if ($request->tipe) {
            $query->where("tipe", $request->tipe);
        }

        if ($request->search) {
            $query->where("judul", "like", "%" . $request->search . "%");
        }

        $kontens = $query
            ->orderBy("created_at", "desc")
            ->paginate($request->limit ?? 10);

        return KontenResource::collection($kontens)->additional([
            "success" => true,
            "message" => "Daftar konten berhasil diambil.",
        ]);
    }

    /**
     * Store new content.
     */
    public function store(Request $request)
    {
        $request->validate([
            "judul" => "required|string|max:255",
            "isi" => "required|string",
            "tipe" => "required|in:berita,pengumuman,agenda,galeri",
            "thumbnail" => "nullable|image|mimes:jpg,jpeg,png|max:512",
        ]);

        $thumbnailPath = null;
        if ($request->hasFile("thumbnail")) {
            $thumbnailPath = $request
                ->file("thumbnail")
                ->store("konten", "public");
            // TODO: Optional Intervention Image resizing
        }

        $konten = Konten::create([
            "judul" => $request->judul,
            "slug" => Str::slug($request->judul) . "-" . time(),
            "isi" => $request->isi,
            "tipe" => $request->tipe,
            "thumbnail" => $thumbnailPath,
            "author_id" => auth()->user()?->id,
            "is_published" => $request->is_published ?? false,
            "published_at" => $request->is_published ? now() : null,
        ]);

        return response()->json(
            [
                "success" => true,
                "message" => "Konten berhasil dibuat.",
                "data" => new KontenResource($konten),
            ],
            201,
        );
    }

    /**
     * Get content detail.
     */
    public function show($id)
    {
        $konten = Konten::with("author")->findOrFail($id);
        return response()->json([
            "success" => true,
            "data" => new KontenResource($konten),
        ]);
    }

    /**
     * Update content.
     */
    public function update(Request $request, $id)
    {
        $konten = Konten::findOrFail($id);

        $request->validate([
            "judul" => "sometimes|string|max:255",
            "isi" => "sometimes|string",
            "tipe" => "sometimes|in:berita,pengumuman,agenda,galeri",
            "thumbnail" => "nullable|image|mimes:jpg,jpeg,png|max:512",
        ]);

        if ($request->hasFile("thumbnail")) {
            if ($konten->thumbnail) {
                Storage::disk("public")->delete($konten->thumbnail);
            }
            $konten->thumbnail = $request
                ->file("thumbnail")
                ->store("konten", "public");
        }

        $updateData = $request->except("thumbnail");
        if ($request->has("judul")) {
            $updateData["slug"] = Str::slug($request->judul) . "-" . time();
        }
        $konten->update($updateData);

        return response()->json([
            "success" => true,
            "message" => "Konten berhasil diperbarui.",
            "data" => new KontenResource($konten),
        ]);
    }

    /**
     * Delete content.
     */
    public function destroy($id)
    {
        $konten = Konten::findOrFail($id);

        if ($konten->thumbnail) {
            Storage::disk("public")->delete($konten->thumbnail);
        }

        $konten->delete();

        return response()->json([
            "success" => true,
            "message" => "Konten berhasil dihapus.",
            "data" => null,
        ]);
    }

    /**
     * Publish/Unpublish content.
     */
    public function togglePublish($id)
    {
        $konten = Konten::findOrFail($id);
        $konten->is_published = !$konten->is_published;
        $konten->published_at = $konten->is_published ? now() : null;
        $konten->save();

        return response()->json([
            "success" => true,
            "message" => $konten->is_published
                ? "Konten berhasil dipublikasikan."
                : "Konten ditarik dari publik.",
            "data" => new KontenResource($konten),
        ]);
    }
}

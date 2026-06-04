<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\API\KontenResource;
use App\Models\Konten;
use App\Services\FileValidationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class KontenController extends Controller
{
    /**
     * Sanitize HTML from WYSIWYG editor to prevent Stored XSS.
     */
    private function sanitizeHtml(string $html): string
    {
        // Allow safe HTML tags from WYSIWYG, strip dangerous ones
        $allowed = '<p><br><strong><b><em><i><u><ul><ol><li><h1><h2><h3><h4><h5><h6><a><img><table><thead><tbody><tr><th><td><blockquote><pre><code><span><div><hr><figure><figcaption>';
        $clean = strip_tags($html, $allowed);
        // Remove all event handlers (onclick, onerror, etc.)
        $clean = preg_replace('/\s*on\w+\s*=\s*["\'][^"\']*["\']|\s*on\w+\s*=\s*\S+/i', '', $clean);
        // Remove javascript: protocol from href/src
        $clean = preg_replace('/\b(href|src)\s*=\s*["\']\s*javascript\s*:/i', '$1=""', $clean);
        return $clean;
    }
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
            ->paginate(min(intval($request->limit ?? 10), 100));

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
            "thumbnail" => "nullable|image|mimes:jpg,jpeg,png|max:5120",
        ]);

        $thumbnailPath = null;
        if ($request->hasFile("thumbnail")) {
            // Validasi magic bytes untuk thumbnail
            $fileValidator = new FileValidationService();
            $validation = $fileValidator->validate(
                $request->file("thumbnail"),
                ['jpg', 'png', 'gif'],
                5120 // 5MB in KB
            );
            
            if (!$validation['valid']) {
                return response()->json([
                    "success" => false,
                    "message" => "Validasi thumbnail gagal: " . $validation['error'],
                    "data" => null,
                ], 422);
            }

            $thumbnailPath = $request
                ->file("thumbnail")
                ->store("konten", "public");
            // TODO: Optional Intervention Image resizing
        }

        $konten = Konten::create([
            "judul" => $request->judul,
            "slug" => Str::slug($request->judul) . "-" . time(),
            "isi" => $this->sanitizeHtml($request->isi),
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
            "thumbnail" => "nullable|image|mimes:jpg,jpeg,png|max:5120",
        ]);

        if ($request->hasFile("thumbnail")) {
            // Validasi magic bytes untuk thumbnail
            $fileValidator = new FileValidationService();
            $validation = $fileValidator->validate(
                $request->file("thumbnail"),
                ['jpg', 'png', 'gif'],
                5120 // 5MB in KB
            );
            
            if (!$validation['valid']) {
                return response()->json([
                    "success" => false,
                    "message" => "Validasi thumbnail gagal: " . $validation['error'],
                    "data" => null,
                ], 422);
            }

            if ($konten->thumbnail) {
                Storage::disk("public")->delete($konten->thumbnail);
            }
            $konten->thumbnail = $request
                ->file("thumbnail")
                ->store("konten", "public");
        }

        $updateData = $request->except('thumbnail');
        if (isset($updateData['isi'])) {
            $updateData['isi'] = $this->sanitizeHtml($updateData['isi']);
        }
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

    /**
     * Upload an image from the WYSIWYG editor and return its URL.
     */
    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120'
        ]);

        if ($request->hasFile('image')) {
            // Validasi magic bytes untuk image
            $fileValidator = new FileValidationService();
            $validation = $fileValidator->validate(
                $request->file('image'),
                ['jpg', 'png', 'gif'],
                5120 // 5MB in KB
            );
            
            if (!$validation['valid']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi image gagal: ' . $validation['error'],
                    'data' => null,
                ], 422);
            }

            $path = $request->file('image')->store('konten/images', 'public');
            return response()->json([
                'success' => true,
                'url' => asset('storage/' . $path)
            ]);
        }

        return response()->json(['success' => false, 'message' => 'No image uploaded'], 400);
    }
}

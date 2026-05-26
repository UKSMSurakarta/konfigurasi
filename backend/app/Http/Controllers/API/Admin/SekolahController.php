<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Sekolah;
use App\Models\User;
use App\Models\Jawaban;
use App\Models\LevelSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class SekolahController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $opdId = auth()->user()->opd_id;

        $query = Sekolah::where("opd_id", $opdId);

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where("nama", "like", "%{$request->search}%")->orWhere(
                    "npsn",
                    "like",
                    "%{$request->search}%",
                );
            });
        }

        if ($request->jenjang) {
            $query->where("jenjang", $request->jenjang);
        }

        $sekolahs = $query->paginate(10);

        return response()->json([
            "success" => true,
            "data" => $sekolahs,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $opdId = auth()->user()->opd_id;

        // Validasi input
        $validated = $request->validate([
            "nama" => "required|string|max:255",
            "npsn" => "required|string|max:20|unique:sekolahs,npsn",
            "jenjang" => "required|in:TK,SD,SMP,SMA,SMK",
            "kepala_sekolah" => "nullable|string|max:255",
            "alamat" => "nullable|string",
            "email_sekolah" => "nullable|email",
            "telepon" => "nullable|string|max:20",
            "akreditasi" => "nullable|string|max:2",
            "tahun_bergabung" => "nullable|integer|min:1900|max:" . date("Y"),
        ]);

        DB::beginTransaction();
        try {
            // Buat sekolah baru
            $sekolah = Sekolah::create([
                "nama" => $validated["nama"],
                "npsn" => $validated["npsn"],
                "jenjang" => $validated["jenjang"],
                "kepala_sekolah" => $validated["kepala_sekolah"] ?? null,
                "alamat" => $validated["alamat"] ?? null,
                "email_sekolah" => $validated["email_sekolah"] ?? null,
                "telepon" => $validated["telepon"] ?? null,
                "akreditasi" => $validated["akreditasi"] ?? null,
                "tahun_bergabung" => $validated["tahun_bergabung"] ?? date("Y"),
                "opd_id" => $opdId,
                "is_active" => true,
            ]);

            // Auto-generate email dan password untuk user sekolah
            $email =
                strtolower(str_replace(" ", "", $validated["npsn"])) .
                "@sekolah.uksm.local";
            $password = "sekolah123"; // Password default

            // Buat user untuk sekolah
            $user = User::create([
                "name" => $validated["nama"],
                "email" => $email,
                "password" => Hash::make($password),
                "role" => "sekolah",
                "opd_id" => $opdId,
                "sekolah_id" => $sekolah->id,
                "is_active" => true,
            ]);

            DB::commit();

            return response()->json(
                [
                    "success" => true,
                    "message" => "Sekolah berhasil dibuat",
                    "data" => [
                        "sekolah" => $sekolah,
                        "user" => [
                            "email" => $email,
                            "password" => $password, // Kirim password default untuk ditampilkan sekali
                        ],
                    ],
                ],
                201,
            );
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(
                [
                    "success" => false,
                    "message" => "Gagal membuat sekolah: " . $e->getMessage(),
                ],
                500,
            );
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $opdId = auth()->user()->opd_id;
        $sekolah = Sekolah::where("opd_id", $opdId)
            ->with("users")
            ->findOrFail($id);

        return response()->json([
            "success" => true,
            "data" => $sekolah,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $opdId = auth()->user()->opd_id;

        // Validasi bahwa sekolah adalah milik OPD admin
        $sekolah = Sekolah::where("opd_id", $opdId)->findOrFail($id);

        // Validasi input
        $validated = $request->validate([
            "nama" => "required|string|max:255",
            "npsn" => [
                "required",
                "string",
                "max:20",
                Rule::unique("sekolahs", "npsn")->ignore($sekolah->id),
            ],
            "jenjang" => "required|in:TK,SD,SMP,SMA,SMK",
            "kepala_sekolah" => "nullable|string|max:255",
            "alamat" => "nullable|string",
            "email_sekolah" => "nullable|email",
            "telepon" => "nullable|string|max:20",
            "akreditasi" => "nullable|string|max:2",
            "tahun_bergabung" => "nullable|integer|min:1900|max:" . date("Y"),
            "is_active" => "nullable|boolean",
            // Data user sekolah (optional)
            "user_name" => "nullable|string|max:255",
            "user_email" => "nullable|email",
        ]);

        DB::beginTransaction();
        try {
            // Update data sekolah
            $sekolah->update([
                "nama" => $validated["nama"],
                "npsn" => $validated["npsn"],
                "jenjang" => $validated["jenjang"],
                "kepala_sekolah" => $validated["kepala_sekolah"] ?? null,
                "alamat" => $validated["alamat"] ?? null,
                "email_sekolah" => $validated["email_sekolah"] ?? null,
                "telepon" => $validated["telepon"] ?? null,
                "akreditasi" => $validated["akreditasi"] ?? null,
                "tahun_bergabung" =>
                    $validated["tahun_bergabung"] ?? $sekolah->tahun_bergabung,
                "is_active" => $validated["is_active"] ?? $sekolah->is_active,
            ]);

            // Update user sekolah jika ada data user yang dikirim
            if (
                isset($validated["user_name"]) ||
                isset($validated["user_email"])
            ) {
                $user = User::where("sekolah_id", $sekolah->id)
                    ->where("role", "sekolah")
                    ->first();

                if ($user) {
                    $userUpdate = [];
                    if (isset($validated["user_name"])) {
                        $userUpdate["name"] = $validated["user_name"];
                    }
                    if (isset($validated["user_email"])) {
                        // Validasi email unique untuk user
                        $emailExists = User::where(
                            "email",
                            $validated["user_email"],
                        )
                            ->where("id", "!=", $user->id)
                            ->exists();

                        if ($emailExists) {
                            DB::rollBack();
                            return response()->json(
                                [
                                    "success" => false,
                                    "message" => "Email user sudah digunakan",
                                ],
                                422,
                            );
                        }
                        $userUpdate["email"] = $validated["user_email"];
                    }

                    if (!empty($userUpdate)) {
                        $user->update($userUpdate);
                    }
                }
            }

            DB::commit();

            return response()->json([
                "success" => true,
                "message" => "Sekolah berhasil diupdate",
                "data" => $sekolah->fresh("users"),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(
                [
                    "success" => false,
                    "message" =>
                        "Gagal mengupdate sekolah: " . $e->getMessage(),
                ],
                500,
            );
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $opdId = auth()->user()->opd_id;

        // Validasi bahwa sekolah adalah milik OPD admin
        $sekolah = Sekolah::where("opd_id", $opdId)->findOrFail($id);

        // Cek apakah sekolah sudah memiliki jawaban
        $hasJawaban = Jawaban::where("sekolah_id", $sekolah->id)->exists();
        if ($hasJawaban) {
            return response()->json(
                [
                    "success" => false,
                    "message" =>
                        "Sekolah tidak dapat dihapus karena sudah memiliki data jawaban. Nonaktifkan sekolah sebagai gantinya.",
                ],
                422,
            );
        }

        // Cek apakah sekolah sudah memiliki submission
        $hasSubmission = LevelSubmission::where(
            "sekolah_id",
            $sekolah->id,
        )->exists();
        if ($hasSubmission) {
            return response()->json(
                [
                    "success" => false,
                    "message" =>
                        "Sekolah tidak dapat dihapus karena sudah memiliki data submission. Nonaktifkan sekolah sebagai gantinya.",
                ],
                422,
            );
        }

        DB::beginTransaction();
        try {
            // Hapus user yang terkait dengan sekolah
            User::where("sekolah_id", $sekolah->id)->delete();

            // Hapus sekolah
            $sekolah->delete();

            DB::commit();

            return response()->json([
                "success" => true,
                "message" => "Sekolah dan user terkait berhasil dihapus",
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(
                [
                    "success" => false,
                    "message" => "Gagal menghapus sekolah: " . $e->getMessage(),
                ],
                500,
            );
        }
    }
}

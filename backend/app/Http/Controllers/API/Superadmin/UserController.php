<?php

namespace App\Http\Controllers\API\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with(['opd', 'sekolah']);

        if ($request->role) $query->where('role', $request->role);
        if ($request->opd_id) $query->where('opd_id', $request->opd_id);
        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
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
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'role' => 'required|in:superadmin,admin,user,sekolah',
            'opd_id' => 'required_if:role,admin,user|nullable|exists:opds,id',
            'sekolah_id' => 'required_if:role,sekolah|nullable|exists:sekolahs,id',
            'password' => 'nullable|min:8',
        ]);

        $password = $request->password ?? Str::random(10);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($password),
            'role' => $request->role,
            'opd_id' => $request->opd_id,
            'sekolah_id' => $request->sekolah_id,
            'is_active' => true,
        ]);

        // TODO: Send Welcome Email with $password

        return response()->json([
            'success' => true,
            'message' => 'User berhasil dibuat.',
            'data' => $user,
            'generated_password' => $request->password ? null : $password
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'role' => 'sometimes|in:superadmin,admin,user,sekolah',
            'opd_id' => 'nullable|exists:opds,id',
            'sekolah_id' => 'nullable|exists:sekolahs,id',
        ]);

        $user->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'User berhasil diperbarui.',
            'data' => $user
        ]);
    }

    public function toggleActive($id)
    {
        $user = User::findOrFail($id);
        $user->is_active = !$user->is_active;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => $user->is_active ? 'User diaktifkan.' : 'User dinonaktifkan.',
            'data' => $user
        ]);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User berhasil dihapus.'
        ]);
    }

    public function resetPassword($id)
    {
        $user = User::findOrFail($id);
        $newPassword = Str::random(10);
        $user->password = Hash::make($newPassword);
        $user->save();

        // TODO: Send Reset Password Email

        return response()->json([
            'success' => true,
            'message' => 'Password berhasil direset.',
            'data' => ['new_password' => $newPassword]
        ]);
    }
}

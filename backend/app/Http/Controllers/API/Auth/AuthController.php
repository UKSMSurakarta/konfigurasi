<?php

namespace App\Http\Controllers\API\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\API\Auth\LoginRequest;
use App\Http\Resources\API\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Handle user login.
     */
    public function login(LoginRequest $request)
    {
        // 1. Rate Limiting Check
        $throttleKey = mb_strtolower($request->input('email')) . '|' . $request->ip();

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            return response()->json([
                'success' => false,
                'message' => "Terlalu banyak percobaan login. Silakan coba lagi dalam {$seconds} detik.",
                'data' => null
            ], 429);
        }

        // 2. Cloudflare Turnstile Verification
        $http = Http::asForm();
        if (app()->environment('local')) {
            $http = $http->withoutVerifying();
        }

        $turnstileResponse = $http->post('https://challenges.cloudflare.com/turnstile/v0/siteverify', [
            'secret' => env('TURNSTILE_SECRET_KEY', '1x0000000000000000000000000000000AA'), // Dummy key fallback
            'response' => $request->turnstile_token,
            'remoteip' => $request->ip(),
        ]);

        if (!$turnstileResponse->json('success')) {
            RateLimiter::hit($throttleKey, 60); // 1 minute delay
            return response()->json([
                'success' => false,
                'message' => 'Verifikasi keamanan gagal. Silakan muat ulang halaman.',
                'data' => null
            ], 403);
        }

        // 3. User Credentials Check
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            RateLimiter::hit($throttleKey, 60); // 1 minute delay
            return response()->json([
                'success' => false,
                'message' => 'Email atau password salah.',
                'data' => null
            ], 401);
        }

        if (!$user->is_active) {
            RateLimiter::hit($throttleKey, 60);
            return response()->json([
                'success' => false,
                'message' => 'Akun Anda tidak aktif. Silakan hubungi administrator.',
                'data' => null
            ], 403);
        }

        // Successful Login
        RateLimiter::clear($throttleKey);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil.',
            'data' => [
                'user' => new UserResource($user),
                'access_token' => $token,
                'token_type' => 'Bearer',
                'role' => $user->role
            ]
        ]);
    }

    /**
     * Handle user logout.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil.',
            'data' => null
        ]);
    }

    /**
     * Get current authenticated user.
     */
    public function me(Request $request)
    {
        $user = $request->user()->load(['opd', 'sekolah']);

        return response()->json([
            'success' => true,
            'message' => 'Data user berhasil diambil.',
            'data' => new UserResource($user)
        ]);
    }
}

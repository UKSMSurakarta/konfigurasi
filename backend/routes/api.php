<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\Auth\AuthController;

/*
|--------------------------------------------------------------------------
| API Routes - Version 1
|--------------------------------------------------------------------------
*/

// Handle OPTIONS preflight requests for CORS
Route::options('/{any}', function () {
    return response('', 200);
})->where('any', '.*');

Route::prefix('v1')->group(function () {
    
    // Auth Routes
    Route::prefix('auth')->group(function () {
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/register', [AuthController::class, 'register']); // Optional, depends on your needs
        
        Route::middleware('auth:sanctum')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::get('/me', [AuthController::class, 'me']);
        });
    });

    // Protected routes by role
    Route::middleware('auth:sanctum')->group(function () {

        // Superadmin Routes
        Route::middleware('role:superadmin')->prefix('superadmin')->group(function () {
            Route::get('/dashboard', [\App\Http\Controllers\API\Superadmin\DashboardController::class, 'index']);
            Route::get('/monitoring', [\App\Http\Controllers\API\Superadmin\DashboardController::class, 'monitoring']);

            // User Management
            Route::get('users/roles', [\App\Http\Controllers\API\Superadmin\UserController::class, 'roles']);
            Route::apiResource('users', \App\Http\Controllers\API\Superadmin\UserController::class);
            Route::patch('users/{id}/toggle-active', [\App\Http\Controllers\API\Superadmin\UserController::class, 'toggleActive']);
            Route::post('users/{id}/reset-password', [\App\Http\Controllers\API\Superadmin\UserController::class, 'resetPassword']);

            // Sekolah Management
            Route::apiResource('sekolahs', \App\Http\Controllers\API\Superadmin\SekolahController::class);
            Route::post('sekolahs/import', [\App\Http\Controllers\API\Superadmin\SekolahController::class, 'import']);

            // OPD Management
            Route::apiResource('opds', \App\Http\Controllers\API\Superadmin\OpdController::class);

            // Assessment Period Management
            Route::apiResource('periods', \App\Http\Controllers\API\Superadmin\AssessmentPeriodController::class);
            Route::patch('periods/{id}/toggle-active', [\App\Http\Controllers\API\Superadmin\AssessmentPeriodController::class, 'toggleActive']);

            // Pengumuman Management (Superadmin - bisa pilih target all/opd)
            Route::apiResource('pengumumans', \App\Http\Controllers\API\Shared\PengumumanController::class)->except(['show']);
            Route::get('pengumumans-opd-list', [\App\Http\Controllers\API\Shared\PengumumanController::class, 'opdList']);
        });


        // Admin Routes
        Route::middleware('role:admin,superadmin')->prefix('admin')->group(function () {
            // Assessment Management
            Route::prefix('levels')->group(function () {
                Route::get('/', [\App\Http\Controllers\API\Admin\LevelController::class, 'index']);
                Route::post('/', [\App\Http\Controllers\API\Admin\LevelController::class, 'store']);
                Route::put('/{id}', [\App\Http\Controllers\API\Admin\LevelController::class, 'update']);
                Route::delete('/{id}', [\App\Http\Controllers\API\Admin\LevelController::class, 'destroy']);
                Route::patch('/{id}/toggle', [\App\Http\Controllers\API\Admin\LevelController::class, 'toggle']);

                // Questions under levels
                Route::get('/{levelId}/pertanyaans', [\App\Http\Controllers\API\Admin\PertanyaanController::class, 'index']);
                Route::post('/{levelId}/pertanyaans', [\App\Http\Controllers\API\Admin\PertanyaanController::class, 'store']);
            });

            Route::prefix('pertanyaans')->group(function () {
                Route::put('/{id}', [\App\Http\Controllers\API\Admin\PertanyaanController::class, 'update']);
                Route::delete('/{id}', [\App\Http\Controllers\API\Admin\PertanyaanController::class, 'destroy']);
                Route::post('/reorder', [\App\Http\Controllers\API\Admin\PertanyaanController::class, 'reorder']);
            });

            Route::get('/dashboard', [\App\Http\Controllers\API\Admin\DashboardController::class, 'index']);

            // Reporting
            Route::prefix('laporan')->group(function () {
                Route::get('/rekap-sekolah', [\App\Http\Controllers\API\Admin\ReportController::class, 'rekapSekolah']);
                Route::get('/rekap-level', [\App\Http\Controllers\API\Admin\ReportController::class, 'rekapLevel']);
                Route::get('/detail-sekolah/{sekolahId}', [\App\Http\Controllers\API\Admin\ReportController::class, 'detailSekolah']);
                Route::get('/statistik-periode/{periodId}', [\App\Http\Controllers\API\Admin\ReportController::class, 'statistikPeriode']);
            });

            // School Management for Admin
            Route::apiResource('sekolahs', \App\Http\Controllers\API\Admin\SekolahController::class)->only(['index', 'show']);

            // Verification
            Route::prefix('verifikasi')->group(function () {
                Route::get('/', [\App\Http\Controllers\API\Admin\VerificationController::class, 'index']);
                Route::get('/sekolah/{sekolahId}', [\App\Http\Controllers\API\Admin\VerificationController::class, 'showDetails']);
                Route::post('/{sekolahId}/level/{levelId}', [\App\Http\Controllers\API\Admin\VerificationController::class, 'verify']);
            });

            Route::get('/monitoring', [\App\Http\Controllers\API\Admin\DashboardController::class, 'monitoring']);

            // Pengumuman Management (Admin OPD - hanya untuk sekolah OPD sendiri)
            Route::apiResource('pengumumans', \App\Http\Controllers\API\Shared\PengumumanController::class)->except(['show']);
        });

        // Notifications
        Route::prefix('notifications')->group(function () {
            Route::get('/', [\App\Http\Controllers\API\NotificationController::class, 'index']);
            Route::get('/unread-count', [\App\Http\Controllers\API\NotificationController::class, 'unreadCount']);
            Route::patch('/{id}/read', [\App\Http\Controllers\API\NotificationController::class, 'markAsRead']);
            Route::patch('/mark-all-read', [\App\Http\Controllers\API\NotificationController::class, 'markAllAsRead']);
        });

        // User Routes (Content Manager)
        Route::middleware('role:user,admin,superadmin')->prefix('user')->group(function () {
            Route::post('kontens/upload-image', [\App\Http\Controllers\API\Admin\KontenController::class, 'uploadImage']);
            Route::apiResource('kontens', \App\Http\Controllers\API\Admin\KontenController::class);
            Route::patch('kontens/{id}/publish', [\App\Http\Controllers\API\Admin\KontenController::class, 'togglePublish']);
        });

        // Sekolah Routes
        Route::middleware('role:sekolah')->prefix('sekolah')->group(function () {
            Route::get('/levels', [\App\Http\Controllers\API\Sekolah\AssessmentController::class, 'index']);
            Route::get('/levels/{id}/pertanyaans', [\App\Http\Controllers\API\Sekolah\AssessmentController::class, 'show']);
            Route::post('/levels/{id}/jawab', [\App\Http\Controllers\API\Sekolah\AssessmentController::class, 'store']);
            Route::post('/levels/{id}/submit-final', [\App\Http\Controllers\API\Sekolah\AssessmentController::class, 'submitFinal']);
            Route::post('/upload-bukti', [\App\Http\Controllers\API\Sekolah\AssessmentController::class, 'upload']);
            Route::get('/profile', [\App\Http\Controllers\API\Sekolah\AssessmentController::class, 'profile']);
            Route::put('/profile', [\App\Http\Controllers\API\Sekolah\AssessmentController::class, 'updateProfile']);
            
            Route::get('/dashboard', [\App\Http\Controllers\API\Sekolah\AssessmentController::class, 'index']);
        });
    });

    // --- PUBLIC ROUTES (NO AUTH) ---
    Route::prefix('public')->group(function () {
        Route::get('/berita', [\App\Http\Controllers\API\Public\PublicController::class, 'berita']);
        Route::get('/berita/{slug}', [\App\Http\Controllers\API\Public\PublicController::class, 'detailBerita']);
        Route::get('/pengumuman', [\App\Http\Controllers\API\Public\PublicController::class, 'pengumuman']);
        Route::get('/agenda', [\App\Http\Controllers\API\Public\PublicController::class, 'agenda']);
        Route::get('/galeri', [\App\Http\Controllers\API\Public\PublicController::class, 'galeri']);
        Route::get('/ranking-sekolah', [\App\Http\Controllers\API\Public\PublicController::class, 'rankingSekolah']);
        Route::get('/statistik', [\App\Http\Controllers\API\Public\PublicController::class, 'statistik']);
    });
});

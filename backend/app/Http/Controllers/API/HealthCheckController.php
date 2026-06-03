<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HealthCheckController extends Controller
{
    /**
     * Health check endpoint - Protected by ProtectHealthCheck middleware
     * 
     * Response:
     * - 200: All systems operational
     * - 503: Service unavailable
     * - 403: Forbidden (unauthorized access)
     */
    public function check(Request $request)
    {
        try {
            $checks = [
                'database' => $this->checkDatabase(),
                'cache' => $this->checkCache(),
                'storage' => $this->checkStorage(),
                'timestamp' => now()->toIso8601String(),
            ];

            $allHealthy = collect($checks)
                ->filter(fn($v, $k) => $k !== 'timestamp')
                ->every(fn($check) => $check['status'] === 'healthy');

            $statusCode = $allHealthy ? 200 : 503;
            $status = $allHealthy ? 'healthy' : 'degraded';

            return response()->json([
                'status' => $status,
                'checks' => $checks,
                'environment' => app()->environment(),
                'uptime_seconds' => $this->getUptime(),
            ], $statusCode);

        } catch (\Exception $e) {
            \Log::error('Health check failed', [
                'error' => $e->getMessage(),
                'ip' => $request->ip(),
                'timestamp' => now(),
            ]);

            return response()->json([
                'status' => 'unhealthy',
                'message' => 'Health check failed',
                'timestamp' => now()->toIso8601String(),
            ], 503);
        }
    }

    /**
     * Minimal health check - Very fast, basic connectivity check
     * Untuk monitoring sederhana yang tidak butuh detail
     */
    public function upSimple(Request $request)
    {
        try {
            // Check database connectivity only
            DB::connection()->getPdo();
            
            return response()->json([
                'status' => 'up',
                'timestamp' => now()->toIso8601String(),
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'down',
                'timestamp' => now()->toIso8601String(),
            ], 503);
        }
    }

    /**
     * Check database connectivity
     */
    private function checkDatabase(): array
    {
        try {
            DB::connection()->getPdo();
            return [
                'status' => 'healthy',
                'message' => 'Database connection OK',
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'message' => 'Database connection failed',
            ];
        }
    }

    /**
     * Check cache connectivity
     */
    private function checkCache(): array
    {
        try {
            $testKey = 'health_check_' . time();
            \Cache::put($testKey, 'ok', 10);
            $value = \Cache::get($testKey);
            \Cache::forget($testKey);

            if ($value === 'ok') {
                return [
                    'status' => 'healthy',
                    'message' => 'Cache connection OK',
                ];
            }

            return [
                'status' => 'unhealthy',
                'message' => 'Cache test failed',
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'message' => 'Cache connection failed',
            ];
        }
    }

    /**
     * Check storage accessibility
     */
    private function checkStorage(): array
    {
        try {
            $testFile = 'health_check_' . time() . '.txt';
            \Storage::disk('public')->put($testFile, 'health_check');
            \Storage::disk('public')->delete($testFile);

            return [
                'status' => 'healthy',
                'message' => 'Storage access OK',
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'message' => 'Storage access failed',
            ];
        }
    }

    /**
     * Hitung uptime dalam detik
     * Jika file tidak ada, gunakan server start time
     */
    private function getUptime(): int
    {
        try {
            if (function_exists('exec')) {
                $output = @exec('uptime -p 2>/dev/null');
                if (!empty($output)) {
                    return $this->parseUptimeString($output);
                }
            }
        } catch (\Exception $e) {
            // Ignore
        }

        // Fallback: gunakan app start time
        return time() - (int) ($_SERVER['REQUEST_TIME'] ?? time());
    }

    /**
     * Parse uptime string (e.g., "up 2 days, 3 hours, 4 minutes")
     */
    private function parseUptimeString(string $output): int
    {
        $seconds = 0;
        
        if (preg_match('/(\d+)\s+day/', $output, $matches)) {
            $seconds += (int) $matches[1] * 86400;
        }
        if (preg_match('/(\d+)\s+hour/', $output, $matches)) {
            $seconds += (int) $matches[1] * 3600;
        }
        if (preg_match('/(\d+)\s+min/', $output, $matches)) {
            $seconds += (int) $matches[1] * 60;
        }
        
        return $seconds;
    }
}

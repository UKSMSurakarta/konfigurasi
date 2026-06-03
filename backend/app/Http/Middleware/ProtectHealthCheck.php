<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware untuk proteksi endpoint health check /up
 * 
 * Memverifikasi akses berdasarkan:
 * 1. Health Check Token (header X-Health-Check-Token)
 * 2. IP Whitelist (dari environment variable)
 * 
 * Environment Variables:
 * - HEALTH_CHECK_TOKEN: Token untuk health check (required untuk production)
 * - HEALTH_CHECK_IPS: Comma-separated IP addresses (optional, e.g., "127.0.0.1,192.168.1.1")
 * - HEALTH_CHECK_ENABLED: Enable/disable health check (default: true)
 */
class ProtectHealthCheck
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check jika health check disabled
        if (!config('app.health_check_enabled', true)) {
            return response()->json([
                'status' => 'service_unavailable',
                'message' => 'Health check endpoint is disabled'
            ], 503);
        }

        // Check token dari header
        $token = $request->header('X-Health-Check-Token');
        $configuredToken = env('HEALTH_CHECK_TOKEN');
        
        if ($token && $configuredToken && hash_equals($token, $configuredToken)) {
            // ✓ Token valid
            return $next($request);
        }

        // Check IP whitelist
        $clientIp = $request->ip();
        $whitelistedIps = $this->getWhitelistedIps();
        
        if (!empty($whitelistedIps) && in_array($clientIp, $whitelistedIps)) {
            // ✓ IP dalam whitelist
            return $next($request);
        }

        // Check localhost for development
        if (app()->environment('local') && $clientIp === '127.0.0.1') {
            return $next($request);
        }

        // ✗ Akses ditolak
        \Log::warning('Unauthorized health check access attempt', [
            'ip' => $clientIp,
            'path' => $request->path(),
            'user_agent' => $request->userAgent(),
            'timestamp' => now(),
        ]);

        return response()->json([
            'status' => 'forbidden',
            'message' => 'Unauthorized access to health check endpoint'
        ], 403);
    }

    /**
     * Parse whitelisted IPs dari environment variable
     */
    private function getWhitelistedIps(): array
    {
        $ips = env('HEALTH_CHECK_IPS', '');
        if (empty($ips)) {
            return [];
        }

        return array_map('trim', explode(',', $ips));
    }
}

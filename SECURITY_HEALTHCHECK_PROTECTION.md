# 🔒 Dokumentasi Perbaikan - Healthcheck `/up` Terbuka

## Ringkasan

Telah diimplementasikan sistem proteksi untuk endpoint health check yang sebelumnya terbuka untuk publik. Endpoint `/up` (default Laravel health check) sekarang dilindungi dengan autentikasi token dan/atau IP whitelist.

## Kerentanan Awal

**Endpoint:** `GET /up` (default Laravel health check)
**Status:** Terbuka untuk publik tanpa autentikasi
**Risiko:**
- Information disclosure (server status, software versions)
- Reconnaissance untuk potential attack
- Dapat digunakan untuk monitoring sistem target
- Tidak ada kontrol akses

---

## Solusi Implementasi

### 1. Middleware ProtectHealthCheck

**File:** `backend/app/Http/Middleware/ProtectHealthCheck.php`

**Fitur:**
- Token-based authentication (header `X-Health-Check-Token`)
- IP whitelist support (comma-separated IPs)
- Localhost bypass untuk development
- Comprehensive logging untuk audit trail
- Environment-aware (berbeda untuk local vs production)

**Authentication Methods (dalam order prioritas):**
```
1. Token Header: X-Health-Check-Token
   ✓ Jika token valid, akses diberikan
2. IP Whitelist: HEALTH_CHECK_IPS
   ✓ Jika IP dalam whitelist, akses diberikan
3. Localhost (dev only): 127.0.0.1 di environment 'local'
   ✓ Akses diberikan tanpa token
4. Deny: 403 Forbidden + Log
   ✗ Semua akses lainnya ditolak
```

### 2. Health Check Controller

**File:** `backend/app/Http/Controllers/API/HealthCheckController.php`

**Endpoints:**
- `GET /health` - Full health check (detailed)
- `GET /health/up` - Simple health check (minimal)

**Health Checks:**
- Database connectivity
- Cache connectivity
- Storage accessibility
- System uptime
- Environment info

**Response Examples:**

```json
// Full health check (200 OK)
{
  "status": "healthy",
  "checks": {
    "database": {
      "status": "healthy",
      "message": "Database connection OK"
    },
    "cache": {
      "status": "healthy",
      "message": "Cache connection OK"
    },
    "storage": {
      "status": "healthy",
      "message": "Storage access OK"
    },
    "timestamp": "2026-06-03T10:30:45Z"
  },
  "environment": "production",
  "uptime_seconds": 432000
}
```

```json
// Simple health check (200 OK)
{
  "status": "up",
  "timestamp": "2026-06-03T10:30:45Z"
}
```

```json
// Unauthorized access (403 Forbidden)
{
  "status": "forbidden",
  "message": "Unauthorized access to health check endpoint"
}
```

### 3. Route Configuration

**File:** `backend/routes/api.php`

**Routes:**
```php
Route::middleware('protect_health_check')->group(function () {
    Route::get('/health', [HealthCheckController::class, 'check']);
    Route::get('/health/up', [HealthCheckController::class, 'upSimple']);
});
```

### 4. Environment Configuration

**File:** `backend/.env.example` (update .env dengan nilai yang sesuai)

```env
# Health Check Configuration
HEALTH_CHECK_ENABLED=true
HEALTH_CHECK_TOKEN=your-secret-health-check-token
HEALTH_CHECK_IPS=127.0.0.1,192.168.1.10
```

---

## Konfigurasi

### Development Environment
```env
APP_ENV=local
HEALTH_CHECK_ENABLED=true
HEALTH_CHECK_TOKEN=dev-token-123
HEALTH_CHECK_IPS=127.0.0.1,localhost
```

### Production Environment
```env
APP_ENV=production
HEALTH_CHECK_ENABLED=true
HEALTH_CHECK_TOKEN=<strong-random-token>
HEALTH_CHECK_IPS=10.0.0.5,192.168.1.10
```

**Untuk generate token:**
```bash
php -r "echo bin2hex(random_bytes(32));"
# Output: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6...
```

---

## Penggunaan

### 1. Dengan Token Header
```bash
curl -H "X-Health-Check-Token: your-secret-token" \
  https://api.example.com/health
```

### 2. Dengan IP Whitelist (dari approved IP)
```bash
curl https://api.example.com/health
# Jika IP dalam whitelist, langsung diterima
```

### 3. Dari Localhost (development)
```bash
curl http://localhost:8000/health
# Otomatis diterima di local environment
```

### 4. Monitoring dengan Docker/K8s
```yaml
# Kubernetes liveness probe
livenessProbe:
  httpGet:
    path: /health/up
    port: 8000
    httpHeaders:
    - name: X-Health-Check-Token
      value: your-secret-token
  initialDelaySeconds: 10
  periodSeconds: 30
```

---

## Security Features

✅ **Implementasi:**
- Token-based authentication (time-safe comparison)
- IP whitelist dengan format flexible
- Environment detection untuk different security levels
- Comprehensive audit logging
- Protection terhadap timing attacks (hash_equals)
- Rate limiting compatible

✅ **Information Control:**
- Hanya endpoint yang authorized yang bisa akses
- Error messages tidak expose implementation details
- Logging semua unauthorized attempts

✅ **Configuration:**
- Secure defaults (disabled = true)
- Environment-based settings
- Token required untuk production
- Optional IP whitelist untuk extra security

⚠️ **Best Practices:**
1. Gunakan token yang kuat dan random di production
2. Rotate token secara berkala
3. Limit IP whitelist ke monitoring services saja
4. Monitor logs untuk unauthorized attempts
5. Disable health check jika tidak digunakan: `HEALTH_CHECK_ENABLED=false`

---

## Migration dari Default `/up` Endpoint

Laravel's default `/up` endpoint sekarang disabled dan digantikan dengan:
- `/health` - Full health check (protected)
- `/health/up` - Simple health check (protected)

**Jika monitoring tools masih menggunakan `/up`:**
1. Update health check URL ke `/health/up`
2. Tambahkan header `X-Health-Check-Token`
3. Atau whitelist IP tool ke `HEALTH_CHECK_IPS`

---

## Troubleshooting

### 1. "Forbidden: Unauthorized access"
**Penyebab:** Token tidak valid atau IP tidak dalam whitelist
**Solusi:**
```bash
# Verify token
echo "HEALTH_CHECK_TOKEN=your-token" >> .env

# Verify IP whitelist
echo "HEALTH_CHECK_IPS=your-ip" >> .env

# Test dengan curl
curl -H "X-Health-Check-Token: your-token" http://localhost:8000/health
```

### 2. Database check always fails
**Penyebab:** Database connection issue
**Solusi:**
- Check DB credentials di .env
- Verify database is running
- Check network connectivity

### 3. Storage check always fails
**Penyebab:** Storage permission issue
**Solusi:**
```bash
# Ensure storage directory is writable
chmod -R 775 storage/app/public
```

---

## Logging

Semua akses ke health check endpoint di-log:

**Success:**
```
[2026-06-03 10:30:45] Health check accessed successfully
```

**Unauthorized:**
```
[2026-06-03 10:30:45] Unauthorized health check access attempt
- IP: 203.0.113.50
- Path: /health
- User-Agent: curl/7.68.0
```

---

## Files Modified

1. **bootstrap/app.php** - Added middleware alias
2. **routes/api.php** - Added protected health check routes
3. **.env.example** - Added health check configuration

## Files Created

1. **app/Http/Middleware/ProtectHealthCheck.php** - Middleware untuk proteksi
2. **app/Http/Controllers/API/HealthCheckController.php** - Custom health check controller

---

## Summary

Implementasi ini menutup kerentanan health check dengan:
1. ✅ Authentication via token (production requirement)
2. ✅ IP whitelist support (optional extra layer)
3. ✅ Environment-aware security levels
4. ✅ Comprehensive health monitoring
5. ✅ Audit logging untuk security events
6. ✅ Backward compatible dengan monitoring tools
7. ✅ Clear documentation untuk setup

**Status:** Kerentanan Low telah diatasi dengan sistem proteksi berlapis.

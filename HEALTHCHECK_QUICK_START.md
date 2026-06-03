# 🚀 Quick Start - Health Check Protection

## Setup dalam 2 Langkah

### Option 1: Menggunakan Artisan Command (Recommended)
```bash
cd backend
php artisan health-check:setup
```

Ikuti interactive prompts untuk:
- Generate secure token
- Configure IP whitelist (optional)
- Enable/disable health check
- Test endpoints

### Option 2: Manual Setup

1. **Generate token:**
```bash
php -r "echo bin2hex(random_bytes(32));"
# Output: a1b2c3d4e5f6... (simpan token ini)
```

2. **Update .env:**
```env
HEALTH_CHECK_ENABLED=true
HEALTH_CHECK_TOKEN=a1b2c3d4e5f6...
HEALTH_CHECK_IPS=127.0.0.1,192.168.1.10
```

3. **Test:**
```bash
curl -H "X-Health-Check-Token: a1b2c3d4e5f6..." http://localhost:8000/health/up
```

---

## Testing Endpoints

### ✅ Authorized Access (dengan token)
```bash
curl -H "X-Health-Check-Token: your-token" \
  http://localhost:8000/health
```

**Response (200 OK):**
```json
{
  "status": "healthy",
  "checks": { ... },
  "environment": "production",
  "uptime_seconds": 3600
}
```

### ❌ Unauthorized Access (tanpa token)
```bash
curl http://localhost:8000/health
```

**Response (403 Forbidden):**
```json
{
  "status": "forbidden",
  "message": "Unauthorized access to health check endpoint"
}
```

---

## Integration Examples

### Docker/Kubernetes Liveness Probe
```yaml
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

### Monitoring Service (Uptime Robot, etc)
1. Set URL: `https://api.example.com/health/up`
2. Add header: `X-Health-Check-Token: your-secret-token`
3. Set expected status: `200`

### Load Balancer Configuration
```
- Path: /health/up
- Method: GET
- Header: X-Health-Check-Token: your-secret-token
- Expected response: 200 OK with status: "up"
```

---

## Environment Variables

| Variable | Value | Required | Example |
|----------|-------|----------|---------|
| `HEALTH_CHECK_ENABLED` | `true`/`false` | ✓ | `true` |
| `HEALTH_CHECK_TOKEN` | Random 64-char | ✓ Prod | `a1b2c3d4...` |
| `HEALTH_CHECK_IPS` | Comma-separated IPs | ✗ | `127.0.0.1,10.0.0.5` |

---

## Endpoints

| Endpoint | Purpose | Response |
|----------|---------|----------|
| `GET /health` | Full health check | Detailed status + uptime |
| `GET /health/up` | Simple health check | Minimal status only |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 403 Forbidden | Check token in X-Health-Check-Token header |
| Token rejected | Verify token matches HEALTH_CHECK_TOKEN in .env |
| IP not working | Check HEALTH_CHECK_IPS format (comma-separated) |
| Database check fails | Verify DB credentials and connectivity |

---

## Security Checklist

- [ ] Generated strong token (at least 32 chars)
- [ ] Token stored in .env (not in code)
- [ ] HEALTH_CHECK_ENABLED=true for monitoring
- [ ] IP whitelist configured (if available)
- [ ] Token rotated periodically (recommended: quarterly)
- [ ] Monitoring service configured with token
- [ ] Tested endpoints are responding correctly

---

## Files Created/Modified

**Created:**
- `app/Http/Middleware/ProtectHealthCheck.php`
- `app/Http/Controllers/API/HealthCheckController.php`
- `app/Console/Commands/SetupHealthCheck.php`
- `setup-health-check.sh` (optional)

**Modified:**
- `bootstrap/app.php`
- `routes/api.php`
- `.env.example`

**Documentation:**
- `SECURITY_HEALTHCHECK_PROTECTION.md` (full docs)
- `HEALTHCHECK_QUICK_START.md` (this file)

---

**Status:** ✅ Health check endpoint secured with authentication

# 🔐 Laporan Audit Keamanan – SI-UKS Digital

> Audit dilakukan pada: **2 Juni 2026**
> Cakupan: Frontend (React/Vite), Backend (Laravel 12 + Sanctum), API, Database, Auth/Authz, File Upload, Export, Dependency

---

## 📊 Executive Summary

| Tingkat Risiko | Jumlah Temuan |
|---|---|
| 🔴 **Critical** | 6 |
| 🟠 **High** | 8 |
| 🟡 **Medium** | 9 |
| 🟢 **Low** | 5 |
| **Total** | **28** |

**Security Score Saat Ini: 42 / 100**

---

## 🔴 CRITICAL

---

### C-01 | Password Default Plaintext Terekspos di Response API
**File:** `backend/app/Http/Controllers/API/Admin/SekolahController.php` — Line 112

**Penyebab:** Saat admin membuat sekolah baru, backend secara eksplisit mengirimkan password plaintext `"sekolah123"` kembali ke client dalam response JSON:
```php
'password' => $password, // Kirim password default untuk ditampilkan sekali
```

**Dampak:**
- Password default yang sama (`sekolah123`) digunakan untuk semua akun sekolah baru.
- Password plaintext dapat tercatat di log server, browser history, dan proxy/network sniffers.
- Jika HTTPS tidak aktif, password bisa tertangkap man-in-the-middle.
- Semua akun sekolah rentan terhadap credential stuffing karena password identik.

**Rekomendasi:**
1. Generate password acak yang kuat menggunakan `Str::random(12)` untuk setiap sekolah.
2. Kirimkan password ke email kepala sekolah, bukan di response JSON.
3. Paksa ganti password pada login pertama (`force_password_change` flag).

---

### C-02 | Rute Register Terbuka Tanpa Auth dan Tanpa Implementasi
**File:** `backend/routes/api.php` — Line 22

**Penyebab:** Route `POST /auth/register` terdaftar secara publik namun tidak ada method `register()` di `AuthController.php`:
```php
Route::post("/register", [AuthController::class, "register"]); // Optional
```

**Dampak:**
- Request ke endpoint ini akan menyebabkan fatal `BadMethodCallException` yang bisa mengekspos stack trace (dengan `APP_DEBUG=true`).
- Lebih buruk: jika method `register` suatu saat diimplementasikan tanpa validasi, siapa saja bisa membuat akun admin/superadmin.

**Rekomendasi:**
1. Hapus route register karena pendaftaran user dilakukan oleh Superadmin melalui panel admin.
2. Jika memang dibutuhkan, tambahkan middleware yang ketat dan validasi role.

---

### C-03 | APP_DEBUG=true di File .env (Production Risk)
**File:** `backend/.env` — Line 4

**Penyebab:** `APP_DEBUG=true` di file `.env` yang mungkin digunakan juga di environment produksi/staging.

**Dampak:**
- Semua exception PHP ditampilkan lengkap dengan stack trace, nama file, baris kode, query SQL, variabel environment, dan konfigurasi aplikasi.
- Memberikan informasi kritis kepada penyerang untuk memahami struktur aplikasi dan melancarkan serangan yang lebih tepat sasaran.

**Rekomendasi:**
- Set `APP_DEBUG=false` di staging dan production.
- Gunakan `.env.example` sebagai template dan pastikan nilai defaultnya sudah aman.

---

### C-04 | CORS Wildcard `Access-Control-Allow-Origin: *` untuk Request Non-Whitelisted
**File:** `backend/app/Http/Middleware/CorsMiddleware.php` — Line 28-30

**Penyebab:**
```php
// Allow all origins in local development
$response->headers->set('Access-Control-Allow-Origin', '*');
```
Kode ini berlaku **untuk semua request dari origin yang tidak dikenal**, bukan hanya lokal.

**Dampak:**
- Setiap website dari domain manapun dapat melakukan cross-origin request ke API ini.
- Dikombinasikan dengan `Access-Control-Allow-Credentials: true` (line 34), ini menciptakan kondisi yang sangat berbahaya: browser mungkin meneruskan cookie/session pengguna.
- Membuka jalan untuk serangan CSRF dan session hijacking via cross-origin requests.

**Rekomendasi:**
- Hapus fallback wildcard. Tolak (atau tidak set header CORS) untuk origin yang tidak dikenal.
- Jangan pernah mengkombinasikan `Access-Control-Allow-Origin: *` dengan `Access-Control-Allow-Credentials: true`.

---

### C-05 | IDOR pada Endpoint Verifikasi Sekolah
**File:** `backend/app/Http/Controllers/API/Admin/VerificationController.php` — Line 71-131

**Penyebab:** Method `verify()` dan `showDetails()` menerima `$sekolahId` dan `$levelId` dari URL tanpa memverifikasi bahwa sekolah tersebut berada di bawah OPD admin yang sedang login:
```php
$submission = LevelSubmission::where('sekolah_id', $sekolahId)
    ->where('level_id', $levelId)
    ->firstOrFail();
// Tidak ada pengecekan apakah sekolahId ini milik opd_id admin
```

**Dampak:**
- Admin dari OPD A dapat memverifikasi atau menolak submission dari sekolah-sekolah di OPD B hanya dengan mengganti `sekolahId` di URL.
- Dapat digunakan untuk sabotase data kompetitor atau memanipulasi proses penilaian secara ilegal.

**Rekomendasi:**
- Tambahkan validasi: `Sekolah::where('id', $sekolahId)->where('opd_id', auth()->user()->opd_id)->firstOrFail()`.

---

### C-06 | Mass Assignment Tanpa Filter di UserController (Superadmin)
**File:** `backend/app/Http/Controllers/API/Superadmin/UserController.php` — Line 90

**Penyebab:**
```php
$user->update($request->all()); // Sangat berbahaya
```
`$request->all()` meneruskan semua field yang dikirim client, termasuk yang tidak divalidasi seperti `password`, `role`, bahkan `id`.

**Dampak:**
- Penyerang yang berhasil mengirim request ke endpoint ini dapat mengubah field apapun, termasuk mengupgrade role akun menjadi `superadmin`.
- Dapat mengubah password user lain jika field `password` tidak ada di `$hidden` tapi ada di `$fillable`.

**Rekomendasi:**
- Gunakan `$request->only(...)` atau `$validated` untuk field yang boleh diupdate.
- Jangan pernah gunakan `$request->all()` untuk operasi update model.

---

## 🟠 HIGH

---

### H-01 | Tidak Ada Security Headers HTTP
**File:** `backend/app/Http/Middleware/CorsMiddleware.php` dan `bootstrap/app.php`

**Penyebab:** Tidak ada middleware yang menambahkan security headers standar.

**Dampak:** Aplikasi rentan terhadap:
- **XSS** tanpa `Content-Security-Policy`
- **Clickjacking** tanpa `X-Frame-Options`
- **MIME sniffing** tanpa `X-Content-Type-Options`
- **Downgrade attack** tanpa `Strict-Transport-Security (HSTS)`
- **Referrer leakage** tanpa `Referrer-Policy`

**Rekomendasi:** Tambahkan middleware SecurityHeaders dengan header:
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'
Strict-Transport-Security: max-age=31536000; includeSubDomains
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

---

### H-02 | Password Sekolah Hardcoded `"sekolah123"`
**File:** `backend/app/Http/Controllers/API/Admin/SekolahController.php` — Line 89

**Penyebab:**
```php
$password = "sekolah123"; // Password default
```

**Dampak:**
- Semua akun sekolah yang dibuat oleh admin menggunakan password yang sama dan dapat ditebak.
- Credential stuffing attack sangat mudah dilakukan: seorang penyerang yang mengetahui pola email sekolah bisa mencoba login dengan password ini.

**Rekomendasi:** Gunakan `Str::random(12)` dan kirim via email setelah sekolah terdaftar.

---

### H-03 | Tidak Ada Audit Log untuk Login, Logout, dan Perubahan Data Sensitif
**File:** `backend/app/Observers/LevelSubmissionObserver.php`

**Penyebab:** Audit log hanya tersedia untuk event `SUBMIT_FINAL` dari `LevelSubmission`. Tidak ada logging untuk:
- Login berhasil / gagal
- Logout
- Verifikasi/penolakan submission oleh admin
- Perubahan data user (reset password, toggle active)
- Export data laporan
- CRUD sekolah dan OPD

**Dampak:** Jika terjadi insiden keamanan, tidak ada jejak audit untuk investigasi forensik.

**Rekomendasi:** Tambahkan `AuditLog::create()` di setiap aksi sensitif, terutama `AuthController@login`, `AuthController@logout`, dan seluruh mutasi data penting.

---

### H-04 | Turnstile Secret Key di-hardcode di Source Code
**File:** `backend/app/Http/Controllers/API/Auth/AuthController.php` — Line 42

**Penyebab:**
```php
'secret' => env('TURNSTILE_SECRET_KEY', '1x0000000000000000000000000000000AA'),
```
Secret key Turnstile di-hardcode sebagai fallback default langsung di source code.

**Dampak:**
- Jika developer lupa mengatur environment variable, sistem akan menggunakan dummy key yang **selalu mengembalikan `success: true`** — sehingga bypass verifikasi Turnstile di production.
- Secret key seharusnya tidak pernah ada di source code.

**Rekomendasi:**
- Hapus hardcoded fallback. Jika `TURNSTILE_SECRET_KEY` tidak ada, throw exception atau return error.
- Tambahkan ke `.env.example` sebagai wajib diisi.

---

### H-05 | Konten HTML dari WYSIWYG Tidak Di-sanitasi (Stored XSS Risk)
**File:** `backend/app/Http/Controllers/API/Admin/KontenController.php` — Line 47

**Penyebab:** Field `isi` dari konten (artikel/berita) menerima HTML mentah dari editor WYSIWYG tanpa sanitasi:
```php
"isi" => "required|string",
```

**Dampak:**
- Admin konten atau penyerang yang berhasil login sebagai admin dapat menyisipkan tag `<script>` atau event handler berbahaya yang akan dieksekusi oleh browser pembaca.
- Semua pengunjung halaman publik terancam Stored XSS.

**Rekomendasi:** Sanitasi HTML input menggunakan library seperti `stevebauman/purify` atau `HTMLPurifier` sebelum disimpan ke database.

---

### H-06 | Token Sanctum Disimpan di localStorage (XSS Exposure)
**File:** `UKSM/src/api/axios.js` — Line 16; `UKSM/src/context/AuthContext.jsx` — Line 43-44

**Penyebab:**
```js
const token = localStorage.getItem('uksm_token');
localStorage.setItem("uksm_token", access_token);
```

**Dampak:**
- Token di `localStorage` bisa diakses oleh **semua JavaScript** yang berjalan di halaman, termasuk dari skrip XSS (Stored XSS, DOM-based XSS).
- Penyerang yang berhasil injeksi JS dapat mencuri token dan melanjutkan sesi tanpa diketahui.

**Rekomendasi:** Idealnya gunakan `HttpOnly Cookie` untuk menyimpan token. Jika tetap menggunakan localStorage, pastikan CSP header sangat ketat untuk meminimalkan risiko XSS.

---

### H-07 | Endpoint Export Tidak Terlindungi Rate Limit
**File:** Seluruh endpoint laporan di `backend/routes/api.php` (line 159-176)

**Penyebab:** Endpoint-endpoint export (`/admin/laporan/rekap-sekolah`, `/rekap-level`, dll.) tidak memiliki rate limiting spesifik.

**Dampak:**
- Penyerang yang memiliki token valid dapat melakukan ratusan request per detik ke endpoint yang berat (compute-intensive DB queries) untuk melakukan DoS.
- Data sensitif bisa di-scrape secara massal.

**Rekomendasi:** Terapkan `throttle:60,1` atau lebih ketat pada kelompok route laporan.

---

### H-08 | `SESSION_ENCRYPT=false` dan `DB_PASSWORD` Kosong
**File:** `backend/.env` — Line 29, 33

**Penyebab:**
```
DB_PASSWORD=
SESSION_ENCRYPT=false
```

**Dampak:**
- Database MySQL dapat diakses tanpa password (konfigurasi default yang tidak aman).
- Session data tidak dienkripsi, berisi data user yang sensitif.

**Rekomendasi:**
- Set password yang kuat untuk database.
- Set `SESSION_ENCRYPT=true`.

---

## 🟡 MEDIUM

---

### M-01 | Tidak Ada MFA untuk Superadmin
**Penyebab:** Tidak ada implementasi Multi-Factor Authentication (MFA/2FA) untuk akun superadmin.

**Dampak:** Jika credentials superadmin dikompromikan (phishing, brute force, credential stuffing), penyerang mendapat akses penuh ke seluruh sistem tanpa hambatan tambahan.

**Rekomendasi:** Implementasikan TOTP (Time-based OTP) via Google Authenticator menggunakan `pragmarx/google2fa-laravel` untuk role superadmin.

---

### M-02 | `detailSekolah` di ReportController Tidak Cek OPD Ownership (IDOR)
**File:** `backend/app/Http/Controllers/API/Admin/ReportController.php` — Line 123

**Penyebab:**
```php
$sekolah = Sekolah::with('opd')->findOrFail($sekolahId);
// Tidak ada verifikasi bahwa sekolah ini milik opd_id admin
```

**Dampak:** Admin dari OPD manapun dapat mengakses detail jawaban dan data assessment sekolah dari OPD lain.

**Rekomendasi:** Tambahkan filter `->where('opd_id', auth()->user()->opd_id)` kecuali user adalah superadmin.

---

### M-03 | Dependency `xlsx` Versi 0.18.5 Memiliki Kerentanan Diketahui
**File:** `UKSM/package.json` — Line 20

**Penyebab:** Library `xlsx` versi 0.18.5 adalah versi lama yang diketahui memiliki kerentanan prototype pollution.

**Dampak:** Potensi Prototype Pollution yang dapat dieksploitasi dalam kondisi tertentu.

**Rekomendasi:** Upgrade ke versi terbaru atau migrasi ke `exceljs` yang lebih aktif dikelola.

---

### M-04 | `statistikPeriode` Mengekspos Data Semua Sekolah Tanpa Filter OPD
**File:** `backend/app/Http/Controllers/API/Admin/ReportController.php` — Line 168-171

**Penyebab:**
```php
$totalSekolah = Sekolah::count(); // Semua sekolah, tidak filter OPD
```

**Dampak:** Statistik cross-OPD terekspos ke admin yang seharusnya hanya melihat data OPD-nya sendiri.

---

### M-05 | Tidak Ada Validasi Ukuran/Tipe File Gambar yang Ketat (Magic Bytes)
**File:** `backend/app/Http/Controllers/API/Admin/KontenController.php` — Line 48 dan `Sekolah/AssessmentController.php` — Line 351

**Penyebab:** Validasi file hanya berdasarkan ekstensi dan MIME type dari header, bukan dari magic bytes file yang sesungguhnya. Seorang penyerang dapat mengganti nama file berbahaya menjadi `.jpg`.

**Dampak:** Upload file berbahaya yang menyamar sebagai gambar.

**Rekomendasi:** Gunakan fungsi PHP `finfo_file()` atau library untuk verifikasi magic bytes sebelum menyimpan file.

---

### M-06 | Tidak Ada Pembatasan Ukuran Request (Large Payload DoS)
**File:** `backend/app/Http/Middleware/` — tidak ada middleware untuk ini

**Penyebab:** Tidak ada middleware global yang membatasi ukuran body request secara ketat.

**Dampak:** Penyerang dapat mengirim payload JSON sangat besar (multi-MB) ke semua endpoint POST/PUT untuk menghabiskan memori server.

**Rekomendasi:** Tambahkan konfigurasi `post_max_size` dan `upload_max_filesize` di PHP.ini, serta validasi ukuran body di middleware Laravel.

---

### M-07 | Turnstile Token Tidak Di-reset Setelah Login Gagal
**File:** `UKSM/src/pages/LoginPage.jsx`

**Penyebab:** Setelah login gagal, `turnstileToken` state tidak dikosongkan dan widget tidak di-refresh. Pengguna/penyerang dapat mencoba berulang kali tanpa perlu menyelesaikan tantangan baru.

**Dampak:** Melemahkan proteksi Turnstile — token yang sama bisa dicoba berkali-kali selama masa berlakunya.

**Rekomendasi:** Setelah login gagal, reset state token dan panggil `turnstile.reset()`.

---

### M-08 | Error Message Mengungkap Detail Internal
**File:** `backend/app/Http/Controllers/API/Admin/SekolahController.php` — Line 123

**Penyebab:**
```php
'message' => "Gagal membuat sekolah: " . $e->getMessage(),
```

**Dampak:** Pesan error dari PHP exception (yang bisa mengandung nama tabel, query SQL, path file) dikembalikan ke client.

**Rekomendasi:** Log error secara internal dan kembalikan pesan generik ke client.

---

### M-09 | Tidak Ada Validasi Ownership File yang Di-upload (Path Traversal Risk)
**File:** `backend/app/Http/Controllers/API/Sekolah/AssessmentController.php` — Line 354

**Penyebab:**
```php
$path = $request->file("file")->store("bukti", "public");
```
File disimpan ke direktori `storage/app/public/bukti/` yang dapat diakses publik via URL. Tidak ada validasi apakah URL file yang disimpan di `file_path` sebelumnya adalah milik sekolah yang bersangkutan.

**Dampak:** Sekolah berpotensi mengakses file milik sekolah lain.

---

## 🟢 LOW

---

### L-01 | Rute Healthcheck `/up` Terbuka Tanpa Auth
**File:** `backend/bootstrap/app.php` — Line 12

**Dampak:** Mengekspos informasi bahwa server sedang berjalan. Risiko minimal tapi sebaiknya di-IP-whitelist.

---

### L-02 | Log Level `debug` di .env
**File:** `backend/.env` — Line 22 (`LOG_LEVEL=debug`)

**Dampak:** Semua debug query dan data dapat masuk ke log file, berpotensi mengandung data sensitif user.

**Rekomendasi:** Set `LOG_LEVEL=warning` atau `error` di production.

---

### L-03 | Tidak Ada Mekanisme Backup Database Otomatis Terintegrasi
**Penyebab:** File `backup_uks_db.sql` ada di root project, tapi tidak ada scheduled backup otomatis.

**Dampak:** Jika terjadi data loss atau ransomware, tidak ada pemulihan data terstruktur.

**Rekomendasi:** Gunakan `spatie/laravel-backup` untuk backup otomatis terjadwal.

---

### L-04 | Tidak Ada Pembatasan Jumlah Hasil per Halaman (Pagination Abuse)
**File:** Beberapa controller menggunakan `$request->limit ?? 10` tanpa batas maksimum.

**Penyebab:**
```php
->paginate($request->limit ?? 10) // Bisa diset ke 99999
```

**Dampak:** Client bisa request semua data sekaligus dengan mengirim `?limit=99999`.

**Rekomendasi:** Tambahkan `min(intval($request->limit ?? 10), 100)` untuk membatasi maksimum per halaman.

---

### L-05 | Komentar TODO yang Belum Diimplementasikan di Production Code
**File:** Beberapa controller (UserController.php line 68, 130; SekolahController.php line 56)

**Penyebab:**
```php
// TODO: Send Welcome Email with $password
// TODO: Send Reset Password Email
```

**Dampak:** Password baru dibuat tapi tidak dikirimkan ke pemilik akun, menyebabkan masalah operasional dan memaksa admin untuk membagikan password secara tidak aman (via pesan/chat).

---

## 📋 Ringkasan Perbaikan yang Direkomendasikan

| ID | Temuan | Prioritas |
|---|---|---|
| C-01 | Password default plaintext di response | Segera |
| C-02 | Route register terbuka tanpa implementasi | Segera |
| C-03 | APP_DEBUG=true | Segera |
| C-04 | CORS wildcard + credentials | Segera |
| C-05 | IDOR di endpoint verifikasi | Segera |
| C-06 | Mass assignment di UserController | Segera |
| H-01 | Tidak ada security headers | Tinggi |
| H-02 | Password sekolah hardcoded | Tinggi |
| H-03 | Audit log tidak lengkap | Tinggi |
| H-04 | Turnstile secret hardcoded | Tinggi |
| H-05 | Stored XSS dari WYSIWYG | Tinggi |
| H-06 | Token di localStorage | Tinggi |
| H-07 | Export tidak terlindungi rate limit | Tinggi |
| H-08 | DB_PASSWORD kosong, SESSION_ENCRYPT=false | Tinggi |
| M-01 | Tidak ada MFA untuk superadmin | Sedang |
| M-02 | IDOR di detailSekolah | Sedang |
| M-03 | Dependency xlsx rentan | Sedang |
| M-04 | Data cross-OPD di statistikPeriode | Sedang |
| M-05 | Validasi file tidak mengecek magic bytes | Sedang |
| M-06 | Tidak ada limitasi payload | Sedang |
| M-07 | Turnstile tidak reset setelah gagal | Sedang |
| M-08 | Error message ekspos detail internal | Sedang |
| M-09 | Tidak ada validasi ownership file | Sedang |
| L-01-05 | Temuan low risk lainnya | Rendah |

---

## 🔍 Status Keamanan yang Sudah Ada (✅ Baik)

- ✅ Autentikasi menggunakan Laravel Sanctum (token-based)
- ✅ Password di-hash menggunakan `bcrypt` dengan 12 rounds
- ✅ Role-based access control (RBAC) via `CheckRole` middleware
- ✅ Rate limiting pada endpoint login (5 percobaan/60 detik)
- ✅ Cloudflare Turnstile anti-bot pada login
- ✅ Token expiration 12 jam (Sanctum)
- ✅ Validasi input pada sebagian besar endpoint
- ✅ ORM Eloquent (mencegah raw SQL injection pada query biasa)
- ✅ `$hidden` untuk field password di User model
- ✅ CSRF tidak relevan untuk pure API (Sanctum token-based)
- ✅ File upload dibatasi tipe dan ukuran (jpg, png, pdf, max 5MB)

---

*Laporan ini merupakan hasil audit static code analysis. Pengujian penetrasi dinamis (dynamic testing) dapat mengungkap kerentanan tambahan yang tidak terdeteksi dalam analisis statis ini.*

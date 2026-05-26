# 🗄️ Perubahan Nama Database

## Ringkasan Perubahan

Database aplikasi UKSM telah diubah dari **`uks_db`** menjadi **`kominfo`**.

---

## ✅ Status Migrasi

### ✓ Selesai Dikerjakan:

1. ✅ **Database baru dibuat**: `kominfo`
2. ✅ **Semua tabel di-clone**: 22 tabel
3. ✅ **Semua data di-copy**: 
   - 110 users
   - 103 sekolah
   - 7 OPD
   - 1 level
   - 3 pertanyaan
   - 6 jawaban
4. ✅ **File .env diupdate**
5. ✅ **Cache Laravel di-clear**
6. ✅ **Koneksi database terverifikasi**

---

## 📊 Detail Database Baru

```
Nama Database: kominfo
Host: 127.0.0.1
Port: 3306
User: root
Charset: utf8mb4
Collation: utf8mb4_unicode_ci
```

### Tabel yang Ada (22):
```
- assessment_periods      - kontens
- audit_logs             - level_submissions
- cache                  - levels
- cache_locks            - migrations
- failed_jobs            - notifications
- jawabans               - opds
- job_batches            - password_reset_tokens
- jobs                   - pengumumans
- personal_access_tokens - pertanyaans
- pilihan_jawabans       - sekolahs
- sessions               - users
```

---

## 🔧 Cara Menggunakan

### Backend sudah otomatis terkoneksi ke database baru!

Tidak perlu melakukan apa-apa lagi. Aplikasi sudah siap digunakan.

### Verifikasi (Opsional)

Jika ingin memastikan database sudah benar:

```bash
cd D:\laragon\www\UKSM-final\konfigurasi\backend

# Cek nama database aktif
php artisan tinker --execute="echo DB::connection()->getDatabaseName();"

# Output yang benar: kominfo
```

---

## 📁 File-file Penting

| File | Keterangan |
|------|------------|
| `clone_database.php` | Script yang digunakan untuk clone database |
| `DATABASE_MIGRATION_SUMMARY.md` | Dokumentasi lengkap proses migrasi |
| `migrate_database.sql` | SQL script manual (tidak terpakai) |
| `.env` | File konfigurasi (DB_DATABASE=kominfo) |

---

## 🛡️ Backup & Rollback

### Database Lama (Backup)

Database lama **`uks_db`** masih tersimpan sebagai backup dan **TIDAK DIHAPUS**.

Jika sewaktu-waktu perlu kembali ke database lama:

1. **Edit `.env`**:
   ```env
   DB_DATABASE=uks_db
   ```

2. **Clear cache**:
   ```bash
   php artisan config:clear
   php artisan cache:clear
   ```

3. **Restart server** (stop & start Laragon)

### Hapus Database Lama (Opsional)

Jika sudah yakin 100% database baru berjalan dengan baik dan ingin menghemat space:

```sql
-- Jalankan di phpMyAdmin atau MySQL client
DROP DATABASE uks_db;
```

⚠️ **PERINGATAN**: Setelah dihapus, database lama tidak bisa dikembalikan!

---

## 🧪 Testing

### Test Backend

```bash
cd D:\laragon\www\UKSM-final\konfigurasi\backend
php artisan serve
```

Akses: `http://127.0.0.1:8000/api/v1/...`

### Test Frontend

```bash
cd D:\laragon\www\UKSM-final\konfigurasi\UKSM
npm run dev
```

Akses: `http://localhost:5173`

### Login Test

Gunakan kredensial yang sama seperti sebelumnya. Semua user dan password tidak berubah.

---

## 📞 Troubleshooting

### Error: Database 'kominfo' not found

**Solusi**: Jalankan ulang clone script
```bash
php clone_database.php
```

### Error: Koneksi database gagal

**Solusi 1**: Pastikan Laragon sudah running
- Buka
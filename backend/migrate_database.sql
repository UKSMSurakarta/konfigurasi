-- ========================================
-- Script untuk migrasi database
-- Dari: uks_db
-- Ke: kominfo
-- ========================================

-- 1. Buat database baru
CREATE DATABASE IF NOT EXISTS `kominfo`
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- 2. Copy semua tabel dari uks_db ke kominfo
-- Jalankan command berikut di terminal atau phpMyAdmin:
-- mysqldump -u root uks_db | mysql -u root kominfo

-- ATAU gunakan query berikut untuk clone database:

-- USE kominfo;

-- Untuk setiap tabel di uks_db, jalankan:
-- CREATE TABLE nama_tabel LIKE uks_db.nama_tabel;
-- INSERT INTO nama_tabel SELECT * FROM uks_db.nama_tabel;

-- ========================================
-- INSTRUKSI MANUAL:
-- ========================================
-- 1. Buka Laragon Menu > MySQL > phpMyAdmin
-- 2. Buat database baru bernama "kominfo"
-- 3. Export database "uks_db" (tab Export > Go)
-- 4. Import ke database "kominfo" (pilih database kominfo > tab Import)
-- 5. Selesai!
-- ========================================

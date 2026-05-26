<?php
/**
 * Script untuk clone database dari uks_db ke kominfo
 * Jalankan: php clone_database.php
 */

$oldDB = "uks_db";
$newDB = "kominfo";
$host = "127.0.0.1";
$user = "root";
$pass = "";

echo "===========================================\n";
echo "Clone Database: {$oldDB} -> {$newDB}\n";
echo "===========================================\n\n";

try {
    // Connect ke MySQL
    $pdo = new PDO("mysql:host={$host}", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "[1/5] Koneksi ke MySQL... OK\n";

    // Buat database baru
    echo "[2/5] Membuat database '{$newDB}'...\n";
    $pdo->exec(
        "CREATE DATABASE IF NOT EXISTS `{$newDB}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
    );
    echo "      Database '{$newDB}' berhasil dibuat.\n";

    // Get daftar tabel dari database lama
    echo "[3/5] Mengambil daftar tabel dari '{$oldDB}'...\n";
    $stmt = $pdo->query("SHOW TABLES FROM `{$oldDB}`");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "      Ditemukan " . count($tables) . " tabel.\n";

    if (empty($tables)) {
        die("ERROR: Database '{$oldDB}' kosong atau tidak ada!\n");
    }

    // Disable foreign key checks
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");

    // Clone setiap tabel
    echo "[4/5] Clone tabel...\n";
    foreach ($tables as $table) {
        echo "      - {$table}... ";

        // Drop tabel jika sudah ada
        $pdo->exec("DROP TABLE IF EXISTS `{$newDB}`.`{$table}`");

        // Create tabel baru (struktur sama)
        $pdo->exec(
            "CREATE TABLE `{$newDB}`.`{$table}` LIKE `{$oldDB}`.`{$table}`",
        );

        // Copy data
        $pdo->exec(
            "INSERT INTO `{$newDB}`.`{$table}` SELECT * FROM `{$oldDB}`.`{$table}`",
        );

        echo "OK\n";
    }

    // Re-enable foreign key checks
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");

    echo "[5/5] Verifikasi...\n";
    $stmt = $pdo->query("SHOW TABLES FROM `{$newDB}`");
    $newTables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "      Database '{$newDB}' berisi " . count($newTables) . " tabel.\n";

    echo "\n===========================================\n";
    echo "✓ CLONE DATABASE BERHASIL!\n";
    echo "===========================================\n";
    echo "Database baru: {$newDB}\n";
    echo "Total tabel: " . count($newTables) . "\n";
    echo "\nLangkah selanjutnya:\n";
    echo "1. File .env sudah diupdate ke database 'kominfo'\n";
    echo "2. Jalankan: php artisan config:clear\n";
    echo "3. Jalankan: php artisan cache:clear\n";
    echo "4. Test aplikasi Anda\n";
    echo "\nCatatan:\n";
    echo "- Database lama '{$oldDB}' masih ada (backup)\n";
    echo "- Jika ingin hapus: DROP DATABASE {$oldDB};\n";
    echo "===========================================\n";
} catch (PDOException $e) {
    echo "\nERROR: " . $e->getMessage() . "\n";
    echo "\nTroubleshooting:\n";
    echo "- Pastikan MySQL/MariaDB sudah running\n";
    echo "- Cek kredensial database (user, password)\n";
    echo "- Buka Laragon > Start All\n";
    exit(1);
}

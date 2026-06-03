<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;

class FileValidationService
{
    /**
     * Magic bytes (file signatures) untuk berbagai tipe file
     * Sumber: https://en.wikipedia.org/wiki/List_of_file_signatures
     */
    private const MAGIC_BYTES = [
        'jpg' => [
            'signatures' => [
                ['FF', 'D8', 'FF', 'E0'],  // JPEG with JFIF
                ['FF', 'D8', 'FF', 'E1'],  // JPEG with EXIF
                ['FF', 'D8', 'FF', 'E2'],  // JPEG with ICC Profile
                ['FF', 'D8', 'FF', 'E8'],  // JPEG with SPIFF
            ],
            'mime_types' => ['image/jpeg'],
            'extensions' => ['jpg', 'jpeg'],
        ],
        'png' => [
            'signatures' => [
                ['89', '50', '4E', '47', '0D', '0A', '1A', '0A'],  // PNG
            ],
            'mime_types' => ['image/png'],
            'extensions' => ['png'],
        ],
        'pdf' => [
            'signatures' => [
                ['25', '50', '44', '46'],  // PDF
            ],
            'mime_types' => ['application/pdf'],
            'extensions' => ['pdf'],
        ],
        'gif' => [
            'signatures' => [
                ['47', '49', '46', '38', '37', '61'],  // GIF87a
                ['47', '49', '46', '38', '39', '61'],  // GIF89a
            ],
            'mime_types' => ['image/gif'],
            'extensions' => ['gif'],
        ],
        'bmp' => [
            'signatures' => [
                ['42', '4D'],  // BMP
            ],
            'mime_types' => ['image/bmp'],
            'extensions' => ['bmp'],
        ],
    ];

    /**
     * Validasi file berdasarkan magic bytes
     * 
     * @param UploadedFile $file
     * @param array $allowedTypes ['jpg', 'png', 'pdf', 'gif', 'bmp']
     * @return array ['valid' => bool, 'error' => string|null, 'detected_type' => string|null]
     */
    public function validateMagicBytes(UploadedFile $file, array $allowedTypes = ['jpg', 'png', 'pdf']): array
    {
        try {
            // 1. Validasi extension
            $extension = strtolower($file->getClientOriginalExtension());
            if (!in_array($extension, array_merge(...array_column(self::MAGIC_BYTES, 'extensions')))) {
                return [
                    'valid' => false,
                    'error' => 'Tipe file tidak didukung berdasarkan ekstensi.',
                    'detected_type' => null
                ];
            }

            // 2. Baca file signature dari bytes pertama
            $fileHandle = fopen($file->getRealPath(), 'rb');
            if (!$fileHandle) {
                return [
                    'valid' => false,
                    'error' => 'Tidak dapat membaca file.',
                    'detected_type' => null
                ];
            }

            $bytes = fread($fileHandle, 8);
            fclose($fileHandle);

            if (empty($bytes)) {
                return [
                    'valid' => false,
                    'error' => 'File kosong atau tidak valid.',
                    'detected_type' => null
                ];
            }

            // Ubah bytes menjadi hex string
            $hexString = strtoupper(bin2hex($bytes));
            $hexArray = str_split($hexString, 2);

            // 3. Deteksi tipe file berdasarkan magic bytes
            $detectedType = null;
            foreach (self::MAGIC_BYTES as $type => $typeData) {
                foreach ($typeData['signatures'] as $signature) {
                    if ($this->checkSignature($hexArray, $signature)) {
                        $detectedType = $type;
                        break 2;
                    }
                }
            }

            // 4. Jika tidak terdeteksi, return error
            if (!$detectedType) {
                return [
                    'valid' => false,
                    'error' => 'File tidak sesuai dengan format yang diharapkan (magic bytes tidak valid).',
                    'detected_type' => null
                ];
            }

            // 5. Verifikasi tipe file terdeteksi dalam allowed types
            if (!in_array($detectedType, $allowedTypes)) {
                return [
                    'valid' => false,
                    'error' => "Tipe file '{$detectedType}' tidak diizinkan. Silakan upload file: " . implode(', ', $allowedTypes),
                    'detected_type' => $detectedType
                ];
            }

            // 6. Verifikasi extension sesuai dengan detected type
            if (!in_array($extension, self::MAGIC_BYTES[$detectedType]['extensions'])) {
                return [
                    'valid' => false,
                    'error' => "Ekstensi file tidak sesuai dengan tipe file sebenarnya (magic bytes menunjukkan tipe: {$detectedType}).",
                    'detected_type' => $detectedType
                ];
            }

            return [
                'valid' => true,
                'error' => null,
                'detected_type' => $detectedType
            ];

        } catch (\Exception $e) {
            return [
                'valid' => false,
                'error' => 'Terjadi kesalahan saat validasi file: ' . $e->getMessage(),
                'detected_type' => null
            ];
        }
    }

    /**
     * Check apakah hex array dimulai dengan signature
     */
    private function checkSignature(array $hexArray, array $signature): bool
    {
        if (count($hexArray) < count($signature)) {
            return false;
        }

        for ($i = 0; $i < count($signature); $i++) {
            if ($hexArray[$i] !== $signature[$i]) {
                return false;
            }
        }

        return true;
    }

    /**
     * Validasi file dengan opsi lengkap
     */
    public function validate(
        UploadedFile $file,
        array $allowedTypes = ['jpg', 'png', 'pdf'],
        int $maxSizeKB = 5120
    ): array {
        // Check magic bytes
        $magicValidation = $this->validateMagicBytes($file, $allowedTypes);
        if (!$magicValidation['valid']) {
            return $magicValidation;
        }

        // Check file size
        $fileSizeKB = $file->getSize() / 1024;
        if ($fileSizeKB > $maxSizeKB) {
            return [
                'valid' => false,
                'error' => "Ukuran file terlalu besar (max: {$maxSizeKB}KB, aktual: " . round($fileSizeKB, 2) . "KB)",
                'detected_type' => $magicValidation['detected_type']
            ];
        }

        return $magicValidation;
    }
}

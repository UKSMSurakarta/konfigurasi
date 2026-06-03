/**
 * Validasi magic bytes file di frontend
 * Memverifikasi tipe file berdasarkan byte signature, bukan hanya extension
 */

const MAGIC_BYTES = {
    jpg: {
        signatures: [
            [0xFF, 0xD8, 0xFF, 0xE0], // JPEG with JFIF
            [0xFF, 0xD8, 0xFF, 0xE1], // JPEG with EXIF
            [0xFF, 0xD8, 0xFF, 0xE2], // JPEG with ICC Profile
            [0xFF, 0xD8, 0xFF, 0xE8], // JPEG with SPIFF
        ],
        mimeTypes: ["image/jpeg"],
        extensions: ["jpg", "jpeg"],
    },
    png: {
        signatures: [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]], // PNG
        mimeTypes: ["image/png"],
        extensions: ["png"],
    },
    pdf: {
        signatures: [[0x25, 0x50, 0x44, 0x46]], // PDF
        mimeTypes: ["application/pdf"],
        extensions: ["pdf"],
    },
    gif: {
        signatures: [
            [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
            [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], // GIF89a
        ],
        mimeTypes: ["image/gif"],
        extensions: ["gif"],
    },
    bmp: {
        signatures: [[0x42, 0x4D]], // BMP
        mimeTypes: ["image/bmp"],
        extensions: ["bmp"],
    },
};

/**
 * Check signature array pada file
 */
const checkSignature = (fileBytes, signature) => {
    if (fileBytes.length < signature.length) {
        return false;
    }
    for (let i = 0; i < signature.length; i++) {
        if (fileBytes[i] !== signature[i]) {
            return false;
        }
    }
    return true;
};

/**
 * Validasi magic bytes dari file
 * @param {File} file - File object dari input
 * @param {Array<string>} allowedTypes - Tipe file yang diizinkan: ['jpg', 'png', 'pdf']
 * @returns {Promise<{valid: boolean, error: string|null, detectedType: string|null}>}
 */
export const validateFileMagicBytes = async (file, allowedTypes = ["jpg", "png", "pdf"]) => {
    try {
        if (!file) {
            return {
                valid: false,
                error: "File tidak ditemukan.",
                detectedType: null,
            };
        }

        // 1. Validasi extension
        const extension = file.name.split(".").pop()?.toLowerCase();
        const allExtensions = Object.values(MAGIC_BYTES).flatMap((t) => t.extensions);
        if (!extension || !allExtensions.includes(extension)) {
            return {
                valid: false,
                error: "Tipe file tidak didukung berdasarkan ekstensi.",
                detectedType: null,
            };
        }

        // 2. Baca bytes pertama dari file
        const bytes = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const arr = new Uint8Array(e.target.result);
                resolve(Array.from(arr));
            };
            reader.onerror = () =>
                reject(new Error("Tidak dapat membaca file."));
            // Baca 8 bytes pertama saja (cukup untuk deteksi)
            reader.readAsArrayBuffer(file.slice(0, 8));
        });

        if (!bytes || bytes.length === 0) {
            return {
                valid: false,
                error: "File kosong atau tidak valid.",
                detectedType: null,
            };
        }

        // 3. Deteksi tipe file berdasarkan magic bytes
        let detectedType = null;
        for (const [type, typeData] of Object.entries(MAGIC_BYTES)) {
            for (const signature of typeData.signatures) {
                if (checkSignature(bytes, signature)) {
                    detectedType = type;
                    break;
                }
            }
            if (detectedType) break;
        }

        // 4. Jika tidak terdeteksi
        if (!detectedType) {
            return {
                valid: false,
                error: "File tidak sesuai dengan format yang diharapkan (magic bytes tidak valid).",
                detectedType: null,
            };
        }

        // 5. Verifikasi tipe terdeteksi dalam allowed types
        if (!allowedTypes.includes(detectedType)) {
            return {
                valid: false,
                error: `Tipe file '${detectedType}' tidak diizinkan. File yang diizinkan: ${allowedTypes.join(", ")}`,
                detectedType,
            };
        }

        // 6. Verifikasi extension sesuai detected type
        if (!MAGIC_BYTES[detectedType].extensions.includes(extension)) {
            return {
                valid: false,
                error: `Ekstensi file tidak sesuai dengan tipe file sebenarnya. File terdeteksi sebagai: ${detectedType}`,
                detectedType,
            };
        }

        return {
            valid: true,
            error: null,
            detectedType,
        };
    } catch (err) {
        return {
            valid: false,
            error: `Terjadi kesalahan saat validasi file: ${err.message}`,
            detectedType: null,
        };
    }
};

/**
 * Validasi file dengan lebih lengkap
 */
export const validateFile = async (
    file,
    allowedTypes = ["jpg", "png", "pdf"],
    maxSizeMB = 5
) => {
    // Check magic bytes
    const magicValidation = await validateFileMagicBytes(file, allowedTypes);
    if (!magicValidation.valid) {
        return magicValidation;
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
        return {
            valid: false,
            error: `Ukuran file terlalu besar (max: ${maxSizeMB}MB, aktual: ${(file.size / 1024 / 1024).toFixed(2)}MB)`,
            detectedType: magicValidation.detectedType,
        };
    }

    return magicValidation;
};

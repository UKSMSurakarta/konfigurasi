# 🔒 Dokumentasi Implementasi - Validasi Magic Bytes File Upload

## Ringkasan

Telah diimplementasikan sistem validasi magic bytes untuk mengatasi kerentanan **Medium - Validasi magic bytes file upload**. Sistem ini memverifikasi tipe file berdasarkan file signature (magic bytes), bukan hanya extension atau MIME type.

## Masalah yang Ditgatasi

**Sebelum:** Validasi file hanya berdasarkan ekstensi `.jpg`, `.png`, `.pdf` tanpa memverifikasi tipe file sebenarnya. Penyerang dapat:
- Mengganti nama file malicious (e.g., `shell.exe`) menjadi `malicious.jpg`
- Upload file yang salah tipe dengan extension yang benar
- Bypass validasi dan menjalankan file berbahaya

**Sesudah:** Setiap file divalidasi dengan mengecek magic bytes (file signature) di tingkat byte pertama file, memastikan file adalah tipe yang sebenarnya.

---

## Implementasi

### 1. Backend - FileValidationService

**File:** `backend/app/Services/FileValidationService.php`

**Fitur:**
- Validasi magic bytes berdasarkan file signature
- Support untuk JPG, PNG, PDF, GIF, BMP
- Validasi ukuran file
- Error handling yang detail

**Magic Bytes yang Didukung:**
```
JPG:  FF D8 FF E0/E1/E2/E8
PNG:  89 50 4E 47 0D 0A 1A 0A
PDF:  25 50 44 46
GIF:  47 49 46 38 37/39 61
BMP:  42 4D
```

**Penggunaan:**
```php
$fileValidator = new FileValidationService();
$validation = $fileValidator->validate(
    $request->file("file"),
    ['jpg', 'png', 'pdf'],
    5120 // max size in KB
);

if (!$validation['valid']) {
    return response()->json(['error' => $validation['error']], 422);
}
```

### 2. Frontend - fileValidation.js Utility

**File:** `UKSM/src/utils/fileValidation.js`

**Fungsi:**
- `validateFileMagicBytes(file, allowedTypes)` - Validasi magic bytes async
- `validateFile(file, allowedTypes, maxSizeMB)` - Validasi lengkap (magic bytes + ukuran)

**Penggunaan:**
```javascript
import { validateFile } from "../../utils/fileValidation";

async function handleFileUpload(e) {
    const file = e.target.files[0];
    const validation = await validateFile(file, ['jpg', 'png', 'pdf'], 5);
    
    if (!validation.valid) {
        showToast(validation.error, "error");
        return;
    }
    // Proceed with upload
}
```

---

## File yang Diupdate

### Backend (PHP)

1. **AssessmentController.php** - `/sekolah/upload-bukti`
   - Added FileValidationService import
   - Updated `upload()` method dengan validasi magic bytes

2. **KontenController.php** - Multiple upload endpoints
   - Added FileValidationService import
   - Updated `store()` method untuk thumbnail validation
   - Updated `update()` method untuk thumbnail validation
   - Updated `uploadImage()` method untuk image validation

### Frontend (React)

1. **sekolahAssessment.jsx**
   - Added fileValidation import
   - Updated `handleFileUpload()` dengan validasi magic bytes
   - Max file size: 1MB

2. **UserPage.jsx**
   - Added fileValidation import
   - Updated `handleFile()` dengan validasi magic bytes
   - Max file size: 5MB

3. **KontenDesain.jsx**
   - Added fileValidation import
   - Updated `handleImageUpload()` dengan validasi magic bytes
   - Updated `handleCoverUpload()` dengan validasi magic bytes

4. **SuperAdminkontenDesain.jsx**
   - Added fileValidation import
   - Updated `handleImageUpload()` dengan validasi magic bytes
   - Updated `handleCoverUpload()` dengan validasi magic bytes

---

## Flow Validasi

### Frontend (Pre-validation)
```
User selects file
    ↓
validateFile() checks magic bytes (first 8 bytes)
    ↓
Detects file type dari signature
    ↓
Verifies detected type dalam allowed types
    ↓
Verifies extension matches detected type
    ↓
Checks file size
    ↓
✓ Valid → Send to backend
✗ Invalid → Show error toast, don't upload
```

### Backend (Post-validation)
```
File received from frontend
    ↓
Laravel validates with mimes:jpg,png,pdf
    ↓
FileValidationService validates magic bytes again
    ↓
✓ Valid → Store file
✗ Invalid → Return 422 with error message
```

---

## Allowed File Types & Limits

| Endpoint | File Types | Max Size |
|----------|-----------|----------|
| `/sekolah/upload-bukti` | JPG, PNG, PDF | 1MB |
| `/user/kontens/upload-image` | JPG, PNG, GIF | 5MB |
| `/sekolah/kontens (cover)` | JPG, PNG | 5MB |

---

## Error Messages

Contoh error messages yang ditampilkan ke user:

```javascript
// Tipe file tidak valid
"File tidak sesuai dengan format yang diharapkan (magic bytes tidak valid)."

// Extension tidak sesuai dengan tipe sebenarnya
"Ekstensi file tidak sesuai dengan tipe file sebenarnya. File terdeteksi sebagai: pdf"

// Tipe tidak diizinkan
"Tipe file 'exe' tidak diizinkan. File yang diizinkan: jpg, png, pdf"

// File terlalu besar
"Ukuran file terlalu besar (max: 5MB, aktual: 6.50MB)"
```

---

## Testing

### Test Case 1: Valid JPG File
```javascript
// ✓ Real JPG dengan magic bytes FF D8 FF E0
const validation = await validateFile(validJpg, ['jpg'], 5);
// Result: { valid: true, error: null, detectedType: 'jpg' }
```

### Test Case 2: Malicious EXE dengan extension .jpg
```javascript
// ✗ File shell.exe dengan extension diubah jadi shell.jpg
const validation = await validateFile(maliciousExe, ['jpg'], 5);
// Result: { valid: false, error: "...", detectedType: null }
```

### Test Case 3: File terlalu besar
```javascript
// ✗ Valid JPG tetapi 6MB > 5MB limit
const validation = await validateFile(largePdf, ['pdf'], 5);
// Result: { valid: false, error: "Ukuran file terlalu besar..." }
```

---

## Keamanan & Best Practices

✅ **Implementasi:**
- Magic bytes validation di frontend (UX) dan backend (security)
- File signature verification vs header nur
- Support multiple signatures per type (JPEG variants)
- Detailed error logging untuk audit trail
- MIME type double-check di backend

✅ **Defense in Depth:**
- Browser-side validation (fast feedback)
- Server-side validation (security guarantee)
- File size limits (prevent DoS)
- Extension verification (defense layer)

⚠️ **Catatan:**
- Magic bytes validation tidak 100% aman terhadap sophisticated attacks
- Perlu additional security: virus scan, sandboxing, file permissions
- Store uploaded files di folder non-executable
- Implement rate limiting untuk upload endpoints

---

## Integrasi dengan Sistem Existing

- ✅ Kompatibel dengan existing error handling
- ✅ Menggunakan existing Toast notification system
- ✅ Tidak breaking changes untuk API contracts
- ✅ Backward compatible dengan existing file uploads

---

## Referensi

- Magic Bytes: https://en.wikipedia.org/wiki/List_of_file_signatures
- OWASP File Upload Security: https://owasp.org/www-community/vulnerabilities/Unrestricted_File_Upload
- CWE-434: Unrestricted Upload of File with Dangerous Type

---

## Summary

Implementasi ini menutup kerentanan validasi magic bytes dengan:
1. Service reusable di backend untuk semua upload endpoint
2. Utility reusable di frontend untuk pre-validation
3. Double validation (frontend + backend) untuk security
4. Clear error messages untuk user guidance
5. Support untuk multiple file types dan limits

# 🏫 Fitur Admin OPD - Kelola Sekolah Binaan

## ✅ Status: SELESAI & SIAP DIGUNAKAN

Admin OPD sekarang dapat mengelola (CRUD) sekolah binaan di OPD mereka sendiri!

---

## 🎯 Ringkasan Fitur

### Yang Sudah Dibuat:

#### **1. Backend API (`SekolahController.php`)**
- ✅ `GET /api/v1/admin/sekolahs` - List sekolah (dengan pagination, search, filter)
- ✅ `POST /api/v1/admin/sekolahs` - Tambah sekolah baru
- ✅ `GET /api/v1/admin/sekolahs/{id}` - Detail sekolah
- ✅ `PUT/PATCH /api/v1/admin/sekolahs/{id}` - Update sekolah
- ✅ `DELETE /api/v1/admin/sekolahs/{id}` - Hapus sekolah

#### **2. Frontend Page (`AdminKelolaSekolah.jsx`)**
- ✅ List sekolah dengan tabel responsif
- ✅ Search by nama/NPSN (debounced)
- ✅ Filter by jenjang (TK, SD, SMP, SMA, SMK)
- ✅ Pagination
- ✅ Modal Add/Edit sekolah
- ✅ Modal Delete dengan konfirmasi
- ✅ Toast notifications

#### **3. Routes & Integration**
- ✅ Route `/admin/sekolah` ditambahkan di `App.jsx`
- ✅ API client functions di `api/admin.js`
- ✅ Import component ke routing Admin

---

## 📊 Perbedaan Admin vs Superadmin

| Fitur | Superadmin | Admin OPD |
|-------|------------|-----------|
| **Akses Sekolah** | Semua OPD | Hanya OPD sendiri |
| **Field OPD Selector** | ✅ Ada | ❌ Tidak ada |
| **Auto OPD Assignment** | Manual pilih | ✅ Otomatis dari user |
| **Judul Halaman** | "Manajemen Sekolah" | "Kelola Sekolah Binaan" |
| **API Endpoint** | `/superadmin/sekolahs` | `/admin/sekolahs` |
| **Scope Filter** | Bisa pilih OPD | OPD user login saja |

---

## 🔐 Security & Validasi

### **Backend Security:**

1. **OPD Isolation** - Semua query otomatis filter berdasarkan `auth()->user()->opd_id`
2. **Ownership Check** - Saat update/delete, validasi sekolah milik OPD yang sama
3. **Relational Integrity** - Prevent delete jika sekolah punya `jawabans` atau `level_submissions`
4. **Input Validation** - Comprehensive validation rules

### **Validation Rules:**

```php
'nama' => 'required|string|max:255',
'npsn' => 'required|string|max:20|unique:sekolahs,npsn',  
'jenjang' => 'required|in:TK,SD,SMP,SMA,SMK',
'kepala_sekolah' => 'nullable|string|max:255',
'alamat' => 'nullable|string',
'email_sekolah' => 'nullable|email',
'telepon' => 'nullable|string|max:20',
```

---

## 🎨 UI/UX Features

### **1. Dashboard Stats**
```
┌─────────────────┬─────────────────┐
│ Total Sekolah   │ Halaman         │
│ 25 sekolah      │ 1 / 3           │
└─────────────────┴─────────────────┘
```

### **2. Filter & Search Bar**
```
┌──────────────────────────────────────────┐
│ 🔍 Cari nama/NPSN... │ Jenjang ▼ │ ➕ Tambah │
└──────────────────────────────────────────┘
```

### **3. Tabel Sekolah**
```
┌────┬─────────────────┬──────────┬─────────┬──────────────┬────────┐
│ No │ Nama Sekolah    │ NPSN     │ Jenjang │ Kepsek       │ Aksi   │
├────┼─────────────────┼──────────┼─────────┼──────────────┼────────┤
│  1 │ SDN 1 Sleman    │ 12345678 │  SD     │ Budi S.Pd    │ ✏️ 🗑️  │
│  2 │ SMPN 2 Gamping  │ 87654321 │  SMP    │ Ani M.Pd     │ ✏️ 🗑️  │
└────┴─────────────────┴──────────┴─────────┴──────────────┴────────┘
```

### **4. Modal Form**
```
┌─────────────────────────────────────┐
│ Tambah Sekolah               [X]    │
├─────────────────────────────────────┤
│
const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

if (!code.includes('import { Suspense, lazy }')) {
    code = 'import { Suspense, lazy } from "react";\n' + code;
}

const pagesToLazyLoad = [
    'SemuaArtikel', 'PublicKontenPreview', 'SekolahDashboard', 'SekolahAssessment',
    'SekolahHasilPenilaian', 'SekolahProfil', 'AdminDashboard', 'AdminVerifikasi',
    'AdminVerifikasiDetail', 'AdminKelolaSekolah', 'Adminlaporan', 'AdminPengaturanSertifikat',
    'SuperadminDashboard', 'SuperadminManajemenOPD', 'SuperAdminSekolah', 'SuperAdminusers',
    'SuperAdminassessment', 'SuperAdminManajemenSoal', 'SuperAdminperiode', 'SuperAdminlaporan',
    'SuperAdminLaporanDetail', 'SuperAdminkonten', 'SuperAdminkontenDesain', 'KontenDashboard',
    'KontenDesain', 'KontenPreview', 'KontenGaleriMedia'
];

pagesToLazyLoad.forEach(page => {
    const regex = new RegExp('import ' + page + ' from "(.*?)";', 'g');
    code = code.replace(regex, 'const ' + page + ' = lazy(() => import("$1"));');
});

if (!code.includes('<Suspense')) {
    code = code.replace('<Routes>', '<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-10 h-10 border-4 border-gray-200 border-t-[#0F6E56] rounded-full animate-spin"></div></div>}>\n      <Routes>');
    code = code.replace('</Routes>', '</Routes>\n      </Suspense>');
}

fs.writeFileSync('src/App.jsx', code);

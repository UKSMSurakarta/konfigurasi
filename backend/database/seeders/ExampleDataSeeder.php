<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ExampleDataSeeder extends Seeder
{
    public function run(): void
    {
        // Disable foreign key constraints to safely truncate/seed
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('opds')->truncate();
        DB::table('sekolahs')->truncate();
        DB::table('assessment_periods')->truncate();
        DB::table('levels')->truncate();
        DB::table('pertanyaans')->truncate();
        DB::table('pilihan_jawabans')->truncate();
        DB::table('jawabans')->truncate();
        DB::table('level_submissions')->truncate();
        DB::table('kontens')->truncate();
        DB::table('pengumumans')->truncate();
        DB::table('users')->where('role', '!=', 'superadmin')->delete();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // 1. OPDs
        $opdNames = [
            ['nama' => 'Dinas Pendidikan dan Kebudayaan', 'kode' => 'DISDIKBUD', 'alamat' => 'Jl. Pendidikan No. 45, Sleman'],
            ['nama' => 'Dinas Kesehatan', 'kode' => 'DINKES', 'alamat' => 'Jl. Kesehatan No. 12, Sleman'],
            ['nama' => 'Kantor Kementerian Agama', 'kode' => 'KEMENAG', 'alamat' => 'Jl. Religi No. 8, Sleman'],
            ['nama' => 'Dinas Lingkungan Hidup', 'kode' => 'DLH', 'alamat' => 'Jl. Lingkungan Hijau No. 3, Sleman'],
            ['nama' => 'Dinas Sosial', 'kode' => 'DINSOS', 'alamat' => 'Jl. Kesejahteraan Sosial No. 17, Sleman'],
            ['nama' => 'Dinas Pemberdayaan Perempuan & Anak', 'kode' => 'DP3A', 'alamat' => 'Jl. Perlindungan Anak No. 9, Sleman'],
        ];

        $opdIds = [];
        foreach ($opdNames as $opd) {
            $opdIds[] = DB::table('opds')->insertGetId([
                'nama' => $opd['nama'],
                'kode' => $opd['kode'],
                'alamat' => $opd['alamat'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Create Admin Users for each OPD
        $opdAdminIds = [];
        foreach ($opdIds as $index => $opdId) {
            $code = strtolower($opdNames[$index]['kode']);
            $opdAdminIds[$opdId] = DB::table('users')->insertGetId([
                'name' => 'Admin ' . $opdNames[$index]['kode'],
                'email' => "admin.{$code}@uks.com",
                'password' => Hash::make('password'),
                'role' => 'admin',
                'opd_id' => $opdId,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 2. Schools Generation (100 schools)
        $kecamatans = ['Depok', 'Mlati', 'Gamping', 'Godean', 'Kalasan', 'Ngaglik', 'Sleman', 'Prambanan', 'Tempel', 'Pakem'];
        $jenjangs = ['TK', 'SD', 'SMP', 'SMA', 'SMK'];
        $schoolTypes = [
            'TK' => ['TK PKK', 'TK Aba', 'TK Kartika', 'TK Bhayangkari', 'TK Islam Terpadu'],
            'SD' => ['SD Negeri 1', 'SD Negeri 2', 'SD Muhammadiyah', 'SD Swasta Kebangsaan', 'SD Islam Al-Azhar'],
            'SMP' => ['SMP Negeri 1', 'SMP Negeri 2', 'SMP Muhammadiyah 1', 'SMP Kristen', 'SMP Islam Terpadu'],
            'SMA' => ['SMA Negeri 1', 'SMA Negeri 2', 'SMA Muhammadiyah 1', 'SMA Budi Luhur'],
            'SMK' => ['SMK Negeri 1', 'SMK Negeri 2', 'SMK Muhammadiyah 1', 'SMK Taman Siswa'],
        ];
        
        $kepalaSekolahFirstNames = ['Budi', 'Ahmad', 'Siti', 'Dewi', 'Sri', 'Hadi', 'Joko', 'Rudi', 'Endang', 'Bambang', 'Yusuf', 'Eko'];
        $kepalaSekolahLastNames = ['Santoso', 'Hidayat', 'Wahyuni', 'Lestari', 'Susilo', 'Mulyono', 'Saputro', 'Prasetyo', 'Kusuma', 'Rahayu'];
        
        $sekolahs = [];
        $npsnCounter = 20300001;

        for ($i = 0; $i < 100; $i++) {
            $jenjang = $jenjangs[array_rand($jenjangs)];
            $kecamatan = $kecamatans[array_rand($kecamatans)];
            $prefix = $schoolTypes[$jenjang][array_rand($schoolTypes[$jenjang])];
            $schoolName = "{$prefix} {$kecamatan}";
            
            // Ensure school name is unique by adding index if needed
            $exists = false;
            foreach ($sekolahs as $s) {
                if ($s['nama'] === $schoolName) {
                    $exists = true;
                    break;
                }
            }
            if ($exists) {
                $schoolName .= " " . rand(3, 9);
            }

            $opdId = $opdIds[array_rand($opdIds)];
            $kepala = $kepalaSekolahFirstNames[array_rand($kepalaSekolahFirstNames)] . ' ' . $kepalaSekolahLastNames[array_rand($kepalaSekolahLastNames)] . ', S.Pd.';
            if (rand(0, 1) === 1) {
                $kepala .= rand(0, 1) === 1 ? ' M.Pd.' : ' M.Si.';
            }

            $akreditasis = ['A', 'A', 'B', 'B', 'B', 'C', null];
            $akreditasi = $akreditasis[array_rand($akreditasis)];

            $sekolahs[] = [
                'nama' => $schoolName,
                'npsn' => (string)$npsnCounter++,
                'jenjang' => $jenjang,
                'alamat' => "Jl. Raya {$kecamatan} No. " . rand(1, 99) . ", Kabupaten Sleman",
                'kepala_sekolah' => $kepala,
                'telepon' => '0812' . rand(10000000, 99999999),
                'email_sekolah' => strtolower(str_replace(' ', '', $schoolName)) . '@sch.id',
                'akreditasi' => $akreditasi,
                'tahun_bergabung' => rand(2018, 2024),
                'opd_id' => $opdId,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        $sekolahIds = [];
        foreach ($sekolahs as $sekolah) {
            $sekolahIds[] = DB::table('sekolahs')->insertGetId($sekolah);
        }

        // Create User accounts for each school
        $schoolUserRecords = [];
        foreach ($sekolahIds as $idx => $sekolahId) {
            $npsn = $sekolahs[$idx]['npsn'];
            $schoolUserRecords[] = [
                'name' => 'Operator ' . $sekolahs[$idx]['nama'],
                'email' => "sekolah{$npsn}@uks.com",
                'password' => Hash::make('password'),
                'role' => 'sekolah',
                'opd_id' => null,
                'sekolah_id' => $sekolahId,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        
        // Chunk users insert to avoid heavy queries
        foreach (array_chunk($schoolUserRecords, 50) as $chunk) {
            DB::table('users')->insert($chunk);
        }

        // 3. Assessment Periods
        $periods = [
            [
                'nama' => 'Tahun Ajaran 2023/2024',
                'tahun' => 2023,
                'tanggal_mulai' => '2023-07-01',
                'tanggal_selesai' => '2024-06-30',
                'is_active' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama' => 'Tahun Ajaran 2024/2025',
                'tahun' => 2024,
                'tanggal_mulai' => '2024-07-01',
                'tanggal_selesai' => '2025-06-30',
                'is_active' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama' => 'Tahun Ajaran 2025/2026',
                'tahun' => 2025,
                'tanggal_mulai' => '2025-07-01',
                'tanggal_selesai' => '2026-06-30',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        $periodIds = [];
        foreach ($periods as $p) {
            $periodIds[] = DB::table('assessment_periods')->insertGetId($p);
        }

        // 4. Levels & Questions Definition
        $levelDefinitions = [
            [
                'nama' => 'Level 1: Strata Dasar',
                'urutan' => 1,
                'deskripsi' => 'Fokus pada standar prasarana minimal UKS dan pelayanan kesehatan dasar siswa.',
                'pertanyaans' => [
                    [
                        'teks' => 'Apakah sekolah memiliki ruang UKS/sudut UKS khusus?',
                        'tipe' => 'ya_tidak',
                        'bobot' => 10,
                        'pilihan' => []
                    ],
                    [
                        'teks' => 'Pilihlah perlengkapan P3K dasar yang tersedia di sekolah Anda:',
                        'tipe' => 'pilihan_ganda',
                        'bobot' => 15,
                        'pilihan' => [
                            ['teks' => 'Lengkap (Obat merah, plester, perban, antiseptik, gunting, kapas)', 'nilai' => 100],
                            ['teks' => 'Sebagian (Hanya perban dan antiseptik)', 'nilai' => 50],
                            ['teks' => 'Sangat minim / Tidak ada perlengkapan P3K', 'nilai' => 0]
                        ]
                    ],
                    [
                        'teks' => 'Apakah terdapat tempat cuci tangan (wastafel) dengan sabun dan air mengalir di dekat area kelas?',
                        'tipe' => 'ya_tidak',
                        'bobot' => 15,
                        'pilihan' => []
                    ],
                    [
                        'teks' => 'Unggah dokumen Surat Keputusan (SK) Tim Pelaksana UKS Sekolah yang aktif.',
                        'tipe' => 'upload',
                        'bobot' => 20,
                        'pilihan' => []
                    ],
                    [
                        'teks' => 'Berapa frekuensi pembersihan toilet/jamban sekolah?',
                        'tipe' => 'pilihan_ganda',
                        'bobot' => 10,
                        'pilihan' => [
                            ['teks' => 'Rutin 2 kali sehari atau lebih', 'nilai' => 100],
                            ['teks' => 'Rutin 1 kali sehari', 'nilai' => 70],
                            ['teks' => '2-3 kali seminggu', 'nilai' => 30],
                            ['teks' => 'Tidak tentu / Jarang dibersihkan', 'nilai' => 0]
                        ]
                    ],
                    [
                        'teks' => 'Tuliskan nama koordinator/guru pembina UKS yang bertugas.',
                        'tipe' => 'isian',
                        'bobot' => 10,
                        'pilihan' => []
                    ],
                ]
            ],
            [
                'nama' => 'Level 2: Strata Standar',
                'urutan' => 2,
                'deskripsi' => 'Kelengkapan administrasi UKS, pelayanan kesehatan promotif, dan keterlibatan puskesmas.',
                'pertanyaans' => [
                    [
                        'teks' => 'Apakah terdapat kader kesehatan remaja / dokter kecil yang aktif di sekolah?',
                        'tipe' => 'ya_tidak',
                        'bobot' => 15,
                        'pilihan' => []
                    ],
                    [
                        'teks' => 'Pilihlah sumber air bersih utama yang digunakan untuk keperluan UKS dan sanitasi:',
                        'tipe' => 'pilihan_ganda',
                        'bobot' => 15,
                        'pilihan' => [
                            ['teks' => 'PDAM / Sumur Bor terlindungi dengan kualitas air jernih dan tidak berbau', 'nilai' => 100],
                            ['teks' => 'Sumur galian biasa dengan kualitas air cukup baik', 'nilai' => 60],
                            ['teks' => 'Membeli air tangki / pasokan air sering terhambat', 'nilai' => 20]
                        ]
                    ],
                    [
                        'teks' => 'Apakah sekolah memiliki buku catatan kesehatan/rekam medis siswa secara tertib?',
                        'tipe' => 'ya_tidak',
                        'bobot' => 10,
                        'pilihan' => []
                    ],
                    [
                        'teks' => 'Bagaimana frekuensi pelaksanaan penyuluhan kesehatan terstruktur di sekolah?',
                        'tipe' => 'pilihan_ganda',
                        'bobot' => 15,
                        'pilihan' => [
                            ['teks' => 'Rutin sebulan sekali atau lebih', 'nilai' => 100],
                            ['teks' => 'Rutin tiap semester', 'nilai' => 60],
                            ['teks' => 'Setahun sekali', 'nilai' => 30],
                            ['teks' => 'Tidak pernah diselenggarakan', 'nilai' => 0]
                        ]
                    ],
                    [
                        'teks' => 'Unggah foto kondisi terbaru ruang UKS sekolah.',
                        'tipe' => 'upload',
                        'bobot' => 20,
                        'pilihan' => []
                    ],
                ]
            ],
            [
                'nama' => 'Level 3: Strata Optimal',
                'urutan' => 3,
                'deskripsi' => 'Pengelolaan kantin sehat, pemilahan sampah, dan imunisasi berkala.',
                'pertanyaans' => [
                    [
                        'teks' => 'Apakah kantin sekolah sudah memiliki sertifikasi kantin sehat atau memenuhi syarat gizi?',
                        'tipe' => 'ya_tidak',
                        'bobot' => 20,
                        'pilihan' => []
                    ],
                    [
                        'teks' => 'Bagaimana sistem pengelolaan sampah organik dan anorganik di sekolah?',
                        'tipe' => 'pilihan_ganda',
                        'bobot' => 15,
                        'pilihan' => [
                            ['teks' => 'Dipisah dengan wadah terpisah dan dikelola (kompos/daur ulang)', 'nilai' => 100],
                            ['teks' => 'Dipisah tetapi langsung dibuang ke pembuangan akhir tanpa pengolahan', 'nilai' => 60],
                            ['teks' => 'Sampah organik dan anorganik dicampur dalam satu wadah', 'nilai' => 0]
                        ]
                    ],
                    [
                        'teks' => 'Apakah sekolah rutin menyelenggarakan kegiatan Bulan Imunisasi Anak Sekolah (BIAS) bekerja sama dengan Puskesmas?',
                        'tipe' => 'ya_tidak',
                        'bobot' => 15,
                        'pilihan' => []
                    ],
                    [
                        'teks' => 'Unggah dokumen MoU/Kemitraan antara sekolah dengan Puskesmas setempat.',
                        'tipe' => 'upload',
                        'bobot' => 20,
                        'pilihan' => []
                    ],
                    [
                        'teks' => 'Apakah terdapat ruang konseling/konsultasi kesehatan psikologis khusus siswa?',
                        'tipe' => 'ya_tidak',
                        'bobot' => 15,
                        'pilihan' => []
                    ],
                ]
            ],
            [
                'nama' => 'Level 4: Strata Paripurna',
                'urutan' => 4,
                'deskripsi' => 'Kemandirian program UKS, inovasi lingkungan, TOGA, dan kebijakan kawasan bebas asap rokok.',
                'pertanyaans' => [
                    [
                        'teks' => 'Apakah sekolah memiliki Taman Obat Keluarga (TOGA) dengan minimal 15 jenis tanaman obat berlabel?',
                        'tipe' => 'ya_tidak',
                        'bobot' => 20,
                        'pilihan' => []
                    ],
                    [
                        'teks' => 'Bagaimana tingkat partisipasi aktif komite/orang tua siswa dalam program UKS?',
                        'tipe' => 'pilihan_ganda',
                        'bobot' => 15,
                        'pilihan' => [
                            ['teks' => 'Sangat aktif (berkontribusi dana, sarana, atau menjadi sukarelawan)', 'nilai' => 100],
                            ['teks' => 'Cukup aktif (hadir dalam sosialisasi/pertemuan)', 'nilai' => 50],
                            ['teks' => 'Kurang aktif / tidak ada kontribusi khusus', 'nilai' => 0]
                        ]
                    ],
                    [
                        'teks' => 'Sebutkan program inovasi kesehatan lingkungan yang dimiliki sekolah Anda.',
                        'tipe' => 'isian',
                        'bobot' => 20,
                        'pilihan' => []
                    ],
                    [
                        'teks' => 'Unggah piagam/sertifikat Adiwiyata atau penghargaan UKS tingkat Kabupaten/Provinsi.',
                        'tipe' => 'upload',
                        'bobot' => 25,
                        'pilihan' => []
                    ],
                    [
                        'teks' => 'Apakah ada kebijakan tertulis (SK/Aturan Sekolah) yang melarang merokok di seluruh area sekolah?',
                        'tipe' => 'ya_tidak',
                        'bobot' => 15,
                        'pilihan' => []
                    ],
                ]
            ]
        ];

        // Seed levels and questions across all 3 periods
        $periodLevelPertanyaans = [];

        foreach ($periodIds as $periodId) {
            foreach ($levelDefinitions as $levelDef) {
                $levelId = DB::table('levels')->insertGetId([
                    'nama' => $levelDef['nama'],
                    'urutan' => $levelDef['urutan'],
                    'deskripsi' => $levelDef['deskripsi'],
                    'period_id' => $periodId,
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                foreach ($levelDef['pertanyaans'] as $qIdx => $q) {
                    $pertanyaanId = DB::table('pertanyaans')->insertGetId([
                        'level_id' => $levelId,
                        'teks_pertanyaan' => $q['teks'],
                        'tipe_jawaban' => $q['tipe'],
                        'bobot' => $q['bobot'],
                        'urutan' => $qIdx + 1,
                        'is_required' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    $pilihanIds = [];
                    if ($q['tipe'] === 'pilihan_ganda') {
                        foreach ($q['pilihan'] as $p) {
                            $pId = DB::table('pilihan_jawabans')->insertGetId([
                                'pertanyaan_id' => $pertanyaanId,
                                'teks' => $p['teks'],
                                'nilai' => $p['nilai'],
                                'created_at' => now(),
                                'updated_at' => now(),
                            ]);
                            $pilihanIds[] = [
                                'id' => $pId,
                                'teks' => $p['teks'],
                                'nilai' => $p['nilai']
                            ];
                        }
                    }

                    $periodLevelPertanyaans[$periodId][$levelDef['urutan']][] = [
                        'id' => $pertanyaanId,
                        'level_id' => $levelId,
                        'tipe' => $q['tipe'],
                        'bobot' => $q['bobot'],
                        'pilihans' => $pilihanIds,
                        'teks_pertanyaan' => $q['teks']
                    ];
                }
            }
        }

        // 5. Generate Submissions & Answers
        $answersToInsert = [];
        $submissionsToInsert = [];

        // Distribute active period school states
        // 20% Haven't started (no entries)
        // 30% Draft (started L1, not finalized)
        // 30% Submitted (submitted L1/L2, awaiting verification)
        // 20% Verified (fully verified on L1/L2)
        $schoolStates = [];
        foreach ($sekolahIds as $idx => $sekolahId) {
            if ($idx < 20) {
                $schoolStates[$sekolahId] = 'verified';
            } elseif ($idx < 50) {
                $schoolStates[$sekolahId] = 'submitted';
            } elseif ($idx < 80) {
                $schoolStates[$sekolahId] = 'draft';
            } else {
                $schoolStates[$sekolahId] = 'not_started';
            }
        }

        $fakerNames = ['Aria', 'Candra', 'Dian', 'Fajar', 'Gita', 'Hendra', 'Indra', 'Kartika', 'Lukman', 'Mega', 'Novi', 'Rian', 'Siska', 'Tio', 'Wulan'];

        foreach ($sekolahIds as $sekolahId) {
            $sekolahData = DB::table('sekolahs')->find($sekolahId);
            $verifierId = $opdAdminIds[$sekolahData->opd_id] ?? null;

            foreach ($periodIds as $periodIdx => $periodId) {
                $isActivePeriod = ($periodIdx === 2); // 2025/2026 is active

                // If active period and state is 'not_started', skip answering
                if ($isActivePeriod && $schoolStates[$sekolahId] === 'not_started') {
                    continue;
                }

                // Process Level 1 to 4
                foreach ([1, 2, 3, 4] as $levelUrutan) {
                    $questions = $periodLevelPertanyaans[$periodId][$levelUrutan] ?? [];
                    if (empty($questions)) continue;

                    $levelId = $questions[0]['level_id'];

                    // Determine submission status for this level
                    $status = 'verified'; // Default for historical periods
                    if ($isActivePeriod) {
                        $state = $schoolStates[$sekolahId];
                        if ($state === 'draft') {
                            $status = ($levelUrutan === 1) ? 'draft' : null;
                        } elseif ($state === 'submitted') {
                            if ($levelUrutan === 1) {
                                $status = 'final';
                            } elseif ($levelUrutan === 2) {
                                $status = 'draft';
                            } else {
                                $status = null;
                            }
                        } elseif ($state === 'verified') {
                            if ($levelUrutan <= 2) {
                                $status = 'verified';
                            } elseif ($levelUrutan === 3) {
                                $status = 'final';
                            } else {
                                $status = 'draft';
                            }
                        }
                    }

                    if (is_null($status)) {
                        continue;
                    }

                    $levelTotalScore = 0;

                    // Generate answers for this level
                    foreach ($questions as $q) {
                        $score = 0;
                        $jawabanTeks = '';
                        $filePath = null;

                        if ($q['tipe'] === 'ya_tidak') {
                            $isYa = ($status === 'draft') ? (rand(0, 1) === 1) : (rand(1, 10) <= 8);
                            $jawabanTeks = $isYa ? 'Ya' : 'Tidak';
                            $score = $isYa ? ($q['bobot']) : 0;
                        } elseif ($q['tipe'] === 'pilihan_ganda') {
                            $opts = $q['pilihans'];
                            if (!empty($opts)) {
                                $chosenOpt = ($status === 'draft') ? $opts[array_rand($opts)] : $opts[0];
                                $jawabanTeks = $chosenOpt['teks'];
                                $score = round(($chosenOpt['nilai'] / 100) * $q['bobot']);
                            }
                        } elseif ($q['tipe'] === 'isian') {
                            if (Str::contains($q['teks_pertanyaan'] ?? '', ['nama', 'koordinator'])) {
                                $jawabanTeks = $fakerNames[array_rand($fakerNames)] . ' ' . $kepalaSekolahLastNames[array_rand($kepalaSekolahLastNames)] . ', S.Pd.';
                            } else {
                                $jawabanTeks = 'Program Green School dan Duta Sanitasi UKS Mandiri.';
                            }
                            $score = $q['bobot'];
                        } elseif ($q['tipe'] === 'upload') {
                            $filePath = 'bukti/dummy_document_' . rand(1, 5) . '.pdf';
                            $jawabanTeks = 'Dokumen terlampir.';
                            $score = $q['bobot'];
                        }

                        $levelTotalScore += $score;

                        $answersToInsert[] = [
                            'sekolah_id' => $sekolahId,
                            'pertanyaan_id' => $q['id'],
                            'period_id' => $periodId,
                            'jawaban_teks' => $jawabanTeks,
                            'nilai' => $score,
                            'file_path' => $filePath,
                            'is_final' => ($status === 'final' || $status === 'verified'),
                            'submitted_at' => ($status === 'final' || $status === 'verified') ? now()->subDays(rand(1, 15)) : null,
                            'created_at' => now()->subDays(rand(16, 30)),
                            'updated_at' => now(),
                        ];
                    }

                    // Create Level Submission
                    $submissionsToInsert[] = [
                        'sekolah_id' => $sekolahId,
                        'level_id' => $levelId,
                        'period_id' => $periodId,
                        'status' => $status,
                        'submitted_at' => ($status === 'final' || $status === 'verified') ? now()->subDays(rand(5, 10)) : null,
                        'finalized_at' => ($status === 'final' || $status === 'verified') ? now()->subDays(rand(5, 10)) : null,
                        'verified_at' => ($status === 'verified') ? now()->subDays(rand(1, 4)) : null,
                        'verifier_id' => ($status === 'verified') ? $verifierId : null,
                        'catatan_verifikator' => ($status === 'verified') ? 'Berkas lengkap dan sesuai standar.' : null,
                        'total_skor' => $levelTotalScore,
                        'created_at' => now()->subDays(rand(15, 30)),
                        'updated_at' => now(),
                    ];
                }
            }
        }

        // Insert answers and submissions in chunks
        foreach (array_chunk($answersToInsert, 200) as $chunk) {
            DB::table('jawabans')->insert($chunk);
        }

        foreach (array_chunk($submissionsToInsert, 100) as $chunk) {
            DB::table('level_submissions')->insert($chunk);
        }

        // 6. Seed Kontens (Announcements & News)
        $kontenAuthor = DB::table('users')->where('role', 'superadmin')->first()->id ?? 1;
        $newsList = [
            [
                'judul' => 'Sosialisasi Program Rapor Kesehatan UKS Digital Tingkat Kabupaten',
                'slug' => 'sosialisasi-program-rapor-kesehatan-uks-digital',
                'isi' => 'Sleman, 2026 - Dinas Pendidikan bekerja sama dengan Dinas Kesehatan menyelenggarakan sosialisasi Rapor Kesehatan UKS Digital untuk memantau kesehatan peserta didik secara real-time. Kegiatan ini diikuti oleh seluruh kepala sekolah dan perwakilan pembina UKS.',
                'tipe' => 'berita',
                'is_published' => true,
            ],
            [
                'judul' => 'Lomba Sekolah Sehat (LSS) Sleman Kembali Digelar Tahun Ini',
                'slug' => 'lomba-sekolah-sehat-sleman-kembali-digelar',
                'isi' => 'Pemerintah Kabupaten kembali menggelar Lomba Sekolah Sehat tingkat TK, SD, SMP, dan SMA. Penilaian akan difokuskan pada kebersihan sarana sanitasi, keaktifan kader kesehatan remaja, serta kualitas kantin sehat sekolah.',
                'tipe' => 'berita',
                'is_published' => true,
            ],
            [
                'judul' => 'Pentingnya Sarana Cuci Tangan Guna Mencegah Penularan Penyakit di Sekolah',
                'slug' => 'pentingnya-sarana-cuci-tangan-di-sekolah',
                'isi' => 'Membiasakan cuci tangan dengan sabun pada air mengalir merupakan salah satu pilar Perilaku Hidup Bersih dan Sehat (PHBS) di sekolah. Dinas Kesehatan menghimbau sekolah untuk selalu merawat wastafel dan menjaga ketersediaan sabun.',
                'tipe' => 'berita',
                'is_published' => true,
            ],
            [
                'judul' => 'Agenda Evaluasi Triwulan Program Pembinaan UKS Mandiri',
                'slug' => 'agenda-evaluasi-triwulan-program-uks',
                'isi' => 'Rapat koordinasi dan evaluasi triwulan akan diadakan pada hari Selasa depan bertempat di Aula Dinas Pendidikan Kabupaten Sleman mulai pukul 09.00 WIB.',
                'tipe' => 'agenda',
                'is_published' => true,
            ],
            [
                'judul' => 'Dokumentasi Pemberian Imunisasi BIAS Serentak',
                'slug' => 'dokumentasi-pemberian-imunisasi-bias',
                'isi' => 'Galeri foto pelaksanaan Bulan Imunisasi Anak Sekolah (BIAS) di beberapa Sekolah Dasar di Kabupaten Sleman.',
                'tipe' => 'galeri',
                'is_published' => true,
            ],
        ];

        foreach ($newsList as $news) {
            DB::table('kontens')->insert([
                'judul' => $news['judul'],
                'slug' => $news['slug'],
                'isi' => $news['isi'],
                'tipe' => $news['tipe'],
                'thumbnail' => null,
                'author_id' => $kontenAuthor,
                'is_published' => $news['is_published'],
                'published_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 7. Seed Pengumumans (Announcements)
        $pengumumanList = [
            [
                'judul' => 'Batas Akhir Pengisian Rapor Kesehatan UKS TA 2025/2026',
                'isi' => 'Dihimbau kepada seluruh sekolah di bawah naungan Dinas Pendidikan Sleman untuk menyelesaikan pengisian kuisioner Level 1 dan Level 2 paling lambat akhir bulan ini.',
                'target_type' => 'all',
                'opd_id' => null,
            ],
            [
                'judul' => 'Verifikasi Lapangan Sekolah Sehat Tingkat Dasar',
                'isi' => 'Tim verifikator Dinas Pendidikan akan melakukan kunjungan lapangan acak ke beberapa SD untuk memverifikasi dokumen bukti fisik yang diunggah di sistem UKSM.',
                'target_type' => 'opd',
                'opd_id' => $opdIds[0], // Dinas Pendidikan
            ],
            [
                'judul' => 'Penyuluhan Kebersihan Lingkungan Sekolah Bebas Jentik',
                'isi' => 'Menghadapi musim penghujan, diharapkan seluruh sekolah aktif melakukan gerakan 3M Plus dan melaporkan status kebersihan lingkungan kepada puskesmas pembina masing-masing.',
                'target_type' => 'all',
                'opd_id' => null,
            ]
        ];

        foreach ($pengumumanList as $p) {
            DB::table('pengumumans')->insert([
                'judul' => $p['judul'],
                'isi' => $p['isi'],
                'sender_id' => $kontenAuthor,
                'target_type' => $p['target_type'],
                'opd_id' => $p['opd_id'],
                'is_published' => true,
                'published_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}

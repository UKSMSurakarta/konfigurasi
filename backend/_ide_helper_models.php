<?php

// @formatter:off
// phpcs:ignoreFile
/**
 * A helper file for your Eloquent Models
 * Copy the phpDocs from this file to the correct Model,
 * And remove them from this file, to prevent double declarations.
 *
 * @author Barry vd. Heuvel <barryvdh@gmail.com>
 */


namespace App\Models{
/**
 * @property int $id
 * @property string $nama
 * @property int $tahun
 * @property \Illuminate\Support\Carbon $tanggal_mulai
 * @property \Illuminate\Support\Carbon $tanggal_selesai
 * @property bool $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Level> $levels
 * @property-read int|null $levels_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AssessmentPeriod newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AssessmentPeriod newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AssessmentPeriod query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AssessmentPeriod whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AssessmentPeriod whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AssessmentPeriod whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AssessmentPeriod whereNama($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AssessmentPeriod whereTahun($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AssessmentPeriod whereTanggalMulai($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AssessmentPeriod whereTanggalSelesai($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AssessmentPeriod whereUpdatedAt($value)
 */
	class AssessmentPeriod extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property string $action
 * @property string|null $auditable_type
 * @property int|null $auditable_id
 * @property string|null $details
 * @property string|null $ip_address
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditLog newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditLog newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditLog query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditLog whereAction($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditLog whereAuditableId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditLog whereAuditableType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditLog whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditLog whereDetails($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditLog whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditLog whereIpAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditLog whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AuditLog whereUserId($value)
 */
	class AuditLog extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $sekolah_id
 * @property int $pertanyaan_id
 * @property int $period_id
 * @property string|null $jawaban_teks
 * @property int $nilai
 * @property string|null $file_path
 * @property int $is_final
 * @property string|null $submitted_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Pertanyaan $pertanyaan
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Jawaban newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Jawaban newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Jawaban query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Jawaban whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Jawaban whereFilePath($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Jawaban whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Jawaban whereIsFinal($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Jawaban whereJawabanTeks($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Jawaban whereNilai($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Jawaban wherePeriodId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Jawaban wherePertanyaanId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Jawaban whereSekolahId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Jawaban whereSubmittedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Jawaban whereUpdatedAt($value)
 */
	class Jawaban extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $judul
 * @property string $slug
 * @property string $isi
 * @property string $tipe
 * @property string|null $thumbnail
 * @property int $author_id
 * @property bool $is_published
 * @property \Illuminate\Support\Carbon|null $published_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User $author
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Konten newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Konten newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Konten query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Konten whereAuthorId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Konten whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Konten whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Konten whereIsPublished($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Konten whereIsi($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Konten whereJudul($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Konten wherePublishedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Konten whereSlug($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Konten whereThumbnail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Konten whereTipe($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Konten whereUpdatedAt($value)
 */
	class Konten extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $nama
 * @property int $urutan
 * @property string|null $deskripsi
 * @property int $period_id
 * @property bool $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\AssessmentPeriod $period
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Pertanyaan> $pertanyaans
 * @property-read int|null $pertanyaans_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\LevelSubmission> $submissions
 * @property-read int|null $submissions_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Level newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Level newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Level query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Level whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Level whereDeskripsi($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Level whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Level whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Level whereNama($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Level wherePeriodId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Level whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Level whereUrutan($value)
 */
	class Level extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $sekolah_id
 * @property int $level_id
 * @property int $period_id
 * @property string $status
 * @property string|null $submitted_at
 * @property string|null $finalized_at
 * @property int $total_skor
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Level $level
 * @property-read \App\Models\Sekolah $sekolah
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LevelSubmission newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LevelSubmission newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LevelSubmission query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LevelSubmission whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LevelSubmission whereFinalizedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LevelSubmission whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LevelSubmission whereLevelId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LevelSubmission wherePeriodId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LevelSubmission whereSekolahId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LevelSubmission whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LevelSubmission whereSubmittedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LevelSubmission whereTotalSkor($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LevelSubmission whereUpdatedAt($value)
 */
	class LevelSubmission extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $nama
 * @property string $kode
 * @property string|null $alamat
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Sekolah> $sekolahs
 * @property-read int|null $sekolahs_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $users
 * @property-read int|null $users_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Opd newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Opd newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Opd query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Opd whereAlamat($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Opd whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Opd whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Opd whereKode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Opd whereNama($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Opd whereUpdatedAt($value)
 */
	class Opd extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $level_id
 * @property string $teks_pertanyaan
 * @property string $tipe_jawaban
 * @property int $bobot
 * @property int $urutan
 * @property bool $is_required
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Jawaban> $jawabans
 * @property-read int|null $jawabans_count
 * @property-read \App\Models\Level $level
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\PilihanJawaban> $pilihanJawabans
 * @property-read int|null $pilihan_jawabans_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Pertanyaan newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Pertanyaan newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Pertanyaan query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Pertanyaan whereBobot($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Pertanyaan whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Pertanyaan whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Pertanyaan whereIsRequired($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Pertanyaan whereLevelId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Pertanyaan whereTeksPertanyaan($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Pertanyaan whereTipeJawaban($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Pertanyaan whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Pertanyaan whereUrutan($value)
 */
	class Pertanyaan extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $pertanyaan_id
 * @property string $teks
 * @property int $nilai
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Pertanyaan $pertanyaan
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PilihanJawaban newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PilihanJawaban newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PilihanJawaban query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PilihanJawaban whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PilihanJawaban whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PilihanJawaban whereNilai($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PilihanJawaban wherePertanyaanId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PilihanJawaban whereTeks($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PilihanJawaban whereUpdatedAt($value)
 */
	class PilihanJawaban extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $nama
 * @property string $npsn
 * @property string $jenjang
 * @property string|null $alamat
 * @property string|null $kepala_sekolah
 * @property int $opd_id
 * @property bool $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Opd $opd
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $users
 * @property-read int|null $users_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Sekolah newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Sekolah newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Sekolah query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Sekolah whereAlamat($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Sekolah whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Sekolah whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Sekolah whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Sekolah whereJenjang($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Sekolah whereKepalaSekolah($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Sekolah whereNama($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Sekolah whereNpsn($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Sekolah whereOpdId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Sekolah whereUpdatedAt($value)
 */
	class Sekolah extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property \Illuminate\Support\Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $remember_token
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property string $role
 * @property int|null $opd_id
 * @property int|null $sekolah_id
 * @property bool $is_active
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \App\Models\Opd|null $opd
 * @property-read \App\Models\Sekolah|null $sekolah
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Laravel\Sanctum\PersonalAccessToken> $tokens
 * @property-read int|null $tokens_count
 * @method static \Database\Factories\UserFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmailVerifiedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereOpdId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRole($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereSekolahId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUpdatedAt($value)
 */
	class User extends \Eloquent {}
}


<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SekolahSertifikat extends Model
{
    protected $fillable = [
        'sekolah_id',
        'period_id',
        'nomor_surat',
        'predikat',
        'is_auto',
        'published_at',
        'file_path',
        'catatan_superadmin',
        'status',
    ];

    protected $casts = [
        'is_auto' => 'boolean',
        'published_at' => 'datetime',
    ];

    public function sekolah()
    {
        return $this->belongsTo(Sekolah::class);
    }

    public function period()
    {
        return $this->belongsTo(AssessmentPeriod::class, 'period_id');
    }
}

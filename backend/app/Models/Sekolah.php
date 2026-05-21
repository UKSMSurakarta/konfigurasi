<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sekolah extends Model
{
    protected $fillable = [
        'nama', 'npsn', 'jenjang', 'alamat', 
        'kepala_sekolah', 'telepon', 'email_sekolah',
        'akreditasi', 'tahun_bergabung', 'opd_id', 'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function opd()
    {
        return $this->belongsTo(Opd::class, 'opd_id');
    }

    public function users()
    {
        return $this->hasMany(User::class, 'sekolah_id');
    }

    public function levelSubmissions()
    {
        return $this->hasMany(LevelSubmission::class, 'sekolah_id');
    }
}


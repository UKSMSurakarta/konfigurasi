<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SertifikatSetting extends Model
{
    protected $fillable = [
        'opd_id',
        'nama_penerbit',
        'jabatan_penandatangan',
        'format_nomor_surat',
        'is_auto_number',
        'logo',
    ];

    protected $casts = [
        'is_auto_number' => 'boolean',
    ];

    public function opd()
    {
        return $this->belongsTo(Opd::class);
    }
}

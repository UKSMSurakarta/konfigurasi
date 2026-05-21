<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Level extends Model
{
    protected $fillable = ['nama', 'urutan', 'deskripsi', 'period_id', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function period()
    {
        return $this->belongsTo(AssessmentPeriod::class, 'period_id');
    }

    public function pertanyaans()
    {
        return $this->hasMany(Pertanyaan::class, 'level_id');
    }

    public function submissions()
    {
        return $this->hasMany(LevelSubmission::class, 'level_id');
    }
}

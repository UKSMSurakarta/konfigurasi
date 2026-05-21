<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pertanyaan extends Model
{
    protected $fillable = [
        'level_id', 'teks_pertanyaan', 'tipe_jawaban', 
        'bobot', 'urutan', 'is_required'
    ];

    protected $casts = [
        'is_required' => 'boolean',
    ];

    public function level()
    {
        return $this->belongsTo(Level::class, 'level_id');
    }

    public function pilihanJawabans()
    {
        return $this->hasMany(PilihanJawaban::class, 'pertanyaan_id');
    }

    public function jawabans()
    {
        return $this->hasMany(Jawaban::class, 'pertanyaan_id');
    }
}

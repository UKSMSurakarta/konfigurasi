<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Jawaban extends Model
{
    protected $fillable = [
        'sekolah_id', 'pertanyaan_id', 'period_id', 
        'jawaban_teks', 'nilai', 'file_path', 'is_final', 'submitted_at'
    ];

    public function pertanyaan()
    {
        return $this->belongsTo(Pertanyaan::class, 'pertanyaan_id');
    }
}

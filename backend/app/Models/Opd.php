<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Opd extends Model
{
    protected $fillable = ['nama', 'kode', 'alamat'];

    public function users()
    {
        return $this->hasMany(User::class, 'opd_id');
    }

    public function sekolahs()
    {
        return $this->hasMany(Sekolah::class, 'opd_id');
    }
}

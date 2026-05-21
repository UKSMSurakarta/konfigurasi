<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pengumuman extends Model
{
    protected $table = 'pengumumans'; // override auto-pluralize (pengumumen → pengumumans)

    protected $fillable = [
        'judul',
        'isi',
        'sender_id',
        'target_type',
        'opd_id',
        'is_published',
        'published_at',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'published_at' => 'datetime',
    ];

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function opd()
    {
        return $this->belongsTo(Opd::class, 'opd_id');
    }
}

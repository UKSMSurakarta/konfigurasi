<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Konten extends Model
{
    protected $fillable = [
        'judul', 'slug', 'isi', 'tipe', 
        'thumbnail', 'author_id', 'is_published', 'published_at'
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'published_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($konten) {
            if (!$konten->slug) {
                $konten->slug = Str::slug($konten->judul) . '-' . uniqid();
            }
        });
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}

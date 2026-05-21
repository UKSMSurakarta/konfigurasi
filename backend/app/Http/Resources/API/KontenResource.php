<?php

namespace App\Http\Resources\API;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class KontenResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'judul' => $this->judul,
            'slug' => $this->slug,
            'isi' => $this->isi,
            'tipe' => $this->tipe,
            'thumbnail_url' => $this->thumbnail ? Storage::url($this->thumbnail) : null,
            'author' => [
                'id' => $this->author->id,
                'name' => $this->author->name,
            ],
            'is_published' => $this->is_published,
            'published_at' => $this->published_at ? $this->published_at->format('Y-m-d H:i:s') : null,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
        ];
    }
}

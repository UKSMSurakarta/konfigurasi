<?php

namespace App\Http\Resources\API;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LevelResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nama' => $this->nama,
            'urutan' => $this->urutan,
            'deskripsi' => $this->deskripsi,
            'period_id' => $this->period_id,
            'is_active' => $this->is_active,
            'pertanyaans_count' => $this->pertanyaans_count ?? $this->pertanyaans()->count(),
            'created_at' => $this->created_at,
        ];
    }
}

<?php

namespace App\Http\Resources\API;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\API\PilihanJawabanResource;

class PertanyaanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'level_id' => $this->level_id,
            'teks_pertanyaan' => $this->teks_pertanyaan,
            'tipe_jawaban' => $this->tipe_jawaban,
            'bobot' => $this->bobot,
            'urutan' => $this->urutan,
            'is_required' => $this->is_required,
            'pilihan_jawabans' => PilihanJawabanResource::collection($this->whenLoaded('pilihanJawabans')),
            'created_at' => $this->created_at,
        ];
    }
}

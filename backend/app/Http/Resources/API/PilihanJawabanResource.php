<?php

namespace App\Http\Resources\API;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PilihanJawabanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'pertanyaan_id' => $this->pertanyaan_id,
            'teks' => $this->teks,
            'nilai' => $this->nilai,
        ];
    }
}

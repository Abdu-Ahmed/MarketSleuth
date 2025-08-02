<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Scanner extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'criteria',
    ];

    protected $casts = [
        'criteria' => 'array',
    ];

    public function results()
    {
        return $this->hasMany(ScannerResult::class);
    }
}
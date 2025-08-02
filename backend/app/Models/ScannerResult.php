<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ScannerResult extends Model
{
    use HasFactory;

    protected $fillable = [
        'scanner_id',
        'ticker',
        'matched_at',
    ];

    protected $casts = [
        'matched_at' => 'datetime',
    ];

    public function scanner()
    {
        return $this->belongsTo(Scanner::class);
    }
}
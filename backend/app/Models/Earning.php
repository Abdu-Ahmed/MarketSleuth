<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Earning extends Model
{
    use HasFactory;

    protected $fillable = [
        'symbol',
        'report_date',
        'time_of_day',
    ];

    protected $casts = [
        'report_date' => 'date',
    ];
}

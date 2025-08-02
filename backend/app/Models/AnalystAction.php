<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnalystAction extends Model
{
    use HasFactory;

    protected $fillable = [
        'symbol',
        'action_date',
        'from_rating',
        'to_rating',
        'source_url',
    ];

    protected $casts = [
        'action_date' => 'date',
    ];
}

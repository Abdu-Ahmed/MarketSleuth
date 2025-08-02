<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'symbol',
        'event_date',
        'type',
        'title',
        'link',
    ];

    protected $casts = [
        'event_date' => 'datetime',
    ];
}

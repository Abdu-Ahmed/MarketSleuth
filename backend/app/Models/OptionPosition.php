<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class OptionPosition extends Model
{
    protected $table = 'option_positions';
    protected $fillable = ['ticker','strike','expiry','premium_received','contracts'];
    protected $casts = ['expiry'=>'date'];
}
<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class DividendRecord extends Model
{
    protected $table = 'dividend_records';
    protected $fillable = ['ticker','amount','ex_date','pay_date'];
    protected $casts = [
        'ex_date' => 'date',
        'pay_date' => 'date',
    ];
}
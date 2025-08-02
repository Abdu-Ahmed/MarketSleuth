<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Form4Record extends Model
{
    protected $table = 'form4_records';
    protected $fillable = [
        'ticker',
        'filer_name',
        'transaction_type',
        'file_value',
        'shares',
        'filed_at',
    ];
    protected $casts = ['filed_at' => 'datetime'];
}
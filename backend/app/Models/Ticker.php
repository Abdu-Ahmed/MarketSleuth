<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ticker extends Model
{
    protected $fillable = [
        'symbol',
        'name',
        'avg_dividend_yield',
        'insider_buys_90d',
    ];

    protected $casts = [
        'avg_dividend_yield' => 'decimal:2',
        'insider_buys_90d' => 'integer',
    ];

    /**
     * Get the latest market data for this ticker
     */
    public function latestMarketData()
    {
        return $this->hasOne(MarketData::class, 'symbol', 'symbol')
            ->orderBy('updated_at', 'desc');
    }

    /**
     * Get all market data for this ticker
     */
    public function marketData()
    {
        return $this->hasMany(MarketData::class, 'symbol', 'symbol');
    }

    /**
     * Get Form4 records for this ticker
     */
    public function form4Records()
    {
        return $this->hasMany(Form4Record::class, 'ticker', 'symbol');
    }
}
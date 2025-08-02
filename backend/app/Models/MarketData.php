<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class MarketData extends Model
{
    protected $table = 'market_data';
    
    protected $fillable = [
        'symbol',
        'price',
        'change',
        'change_pct',
        'volume',
        'open',
        'high',
        'low',
        'close',
        'market_timestamp',
    ];

    protected $casts = [
        'price' => 'decimal:4',
        'change' => 'decimal:4',
        'change_pct' => 'decimal:4',
        'open' => 'decimal:4',
        'high' => 'decimal:4',
        'low' => 'decimal:4',
        'close' => 'decimal:4',
        'volume' => 'integer',
        'market_timestamp' => 'datetime',
    ];

    /**
     * Get the latest market data for a symbol
     */
    public static function getLatest(string $symbol)
    {
        return static::where('symbol', strtoupper($symbol))
            ->orderBy('updated_at', 'desc')
            ->first();
    }

    /**
     * Get the latest market data for multiple symbols
     */
public static function getLatestBatch(array $symbols)
{
    $symbols = array_map('strtoupper', $symbols);
    
    // Get latest record per symbol
    return static::whereIn('symbol', $symbols)
        ->orderBy('updated_at', 'desc')
        ->get()
        ->unique('symbol') // Get first unique symbol (latest due to ordering)
        ->keyBy('symbol');
}
}
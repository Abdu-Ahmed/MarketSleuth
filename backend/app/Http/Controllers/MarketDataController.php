<?php
namespace App\Http\Controllers;

use App\Models\MarketData;
use Illuminate\Support\Facades\Cache;

class MarketDataController extends Controller
{
    private array $symbols = ['AAPL','MSFT','GOOGL','AMZN','TSLA','NVDA','SPY','QQQ'];

    /**
     * Get real-time batch market data from database.
     * Caches for 5 seconds to reduce database load.
     */
public function getMarketTickers()
{
    $cacheKey = 'market_tickers_data';

    return Cache::remember($cacheKey, 5, function () {
        $marketData = MarketData::getLatestBatch($this->symbols);
        
        if ($marketData->isEmpty()) {
            abort(502, "No market data available. Run 'php artisan fetch:tickers' first.");
        }

        // FIX: Convert array to collection
        return collect($this->symbols)
            ->filter(fn($symbol) => $marketData->has($symbol))
            ->map(function($symbol) use ($marketData) {
                $data = $marketData[$symbol];
                return [
                    'symbol' => $symbol,
                    'price' => $data->price,
                    'change' => $data->change,
                    'changePct' => $data->change_pct,
                    'volume' => $data->volume,
                    'lastUpdated' => $data->updated_at->toISOString(),
                ];
            })
            ->values()
            ->all();
    });
}

    /**
     * Get single ticker market data from database.
     */
    public function getTicker(string $symbol)
    {
        $symbol = strtoupper($symbol);
        
        if (!in_array($symbol, $this->symbols)) {
            abort(404, "Symbol {$symbol} not supported");
        }

        $cacheKey = "ticker_data_{$symbol}";
        
        return Cache::remember($cacheKey, 5, function () use ($symbol) {
            $data = MarketData::getLatest($symbol);
            
            if (!$data) {
                abort(502, "No market data available for {$symbol}. Run 'php artisan fetch:tickers' first.");
            }

            return [
                'symbol' => $symbol,
                'price' => $data->price,
                'change' => $data->change,
                'changePct' => $data->change_pct,
                'volume' => $data->volume,
                'lastUpdated' => $data->updated_at->toISOString(),
            ];
        });
    }

    /**
     * Get historical market data for a symbol (last 24 hours)
     */
    public function getTickerHistory(string $symbol)
    {
        $symbol = strtoupper($symbol);
        
        if (!in_array($symbol, $this->symbols)) {
            abort(404, "Symbol {$symbol} not supported");
        }

        $data = MarketData::where('symbol', $symbol)
            ->where('updated_at', '>=', now()->subDay())
            ->orderBy('updated_at', 'asc')
            ->get(['price', 'volume', 'updated_at'])
            ->map(function($record) {
                return [
                    'price' => $record->price,
                    'volume' => $record->volume,
                    'timestamp' => $record->updated_at->toISOString(),
                ];
            });

        if ($data->isEmpty()) {
            abort(404, "No historical data available for {$symbol}");
        }

        return [
            'symbol' => $symbol,
            'history' => $data,
        ];
    }
}
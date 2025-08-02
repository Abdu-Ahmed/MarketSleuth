<?php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use GuzzleHttp\Client;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use App\Models\MarketData;
use App\Models\Ticker;

class FetchTickers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fetch:tickers {--symbols=* : Specific symbols to fetch (optional)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch market data for configured tickers from Polygon.io';

    /**
     * Default symbols to fetch if none specified
     *
     * @var array
     */
    private array $defaultSymbols = ['AAPL','MSFT','GOOGL','AMZN','TSLA','NVDA','SPY','QQQ'];

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $symbols = $this->option('symbols');
        
        if (empty($symbols)) {
            $symbols = $this->defaultSymbols;
            $this->info("No symbols specified, using default symbols: " . implode(', ', $symbols));
        } else {
            $symbols = array_map('strtoupper', $symbols);
            $this->info("Fetching market data for: " . implode(', ', $symbols));
        }

        $apiKey = config('services.plygn.key');
        
        if (!$apiKey) {
            $this->error("Polygon API key not found in config. Please check your .env file.");
            return 1;
        }

        $client = new Client(['base_uri' => 'https://api.polygon.io']);
        
        // Fetch data for each symbol individually (free tier compatible)
        $this->info("Fetching market data from Polygon.io (free tier mode)...");
        
        $allTickerData = [];
        $successCount = 0;
        $errorCount = 0;
        
        foreach ($symbols as $symbol) {
            $tickerData = $this->fetchSymbolData($client, $symbol, $apiKey);
            if ($tickerData) {
                $allTickerData[] = $tickerData;
                $successCount++;
                $price = $tickerData['day']['c'] ?? 'N/A';
                $this->info("✓ {$symbol}: \${$price}");
            } else {
                $this->warn("✗ {$symbol}: Failed to fetch data");
                $errorCount++;
            }
            
            // Rate limiting for free tier
            usleep(250000); // 0.25 second delay between requests
        }
        
        if (empty($allTickerData)) {
            $this->error("No market data was successfully fetched");
            return 1;
        }
        
        $this->info("\nSummary: {$successCount} successful, {$errorCount} failed");
        
        try {
            // Process and display the data
            $this->displayMarketData($allTickerData);
            
            // Store this data in database
            $this->storeMarketData($allTickerData);
            
        } catch (\Exception $e) {
            $this->error("Unexpected error: " . $e->getMessage());
            Log::error("Polygon fetch error: " . $e->getMessage());
            return 1;
        }
        
        return 0;
    }
    
    /**
     * Fetch data for a single symbol using free-tier compatible endpoints
     */
    private function fetchSymbolData(Client $client, string $symbol, string $apiKey): ?array
    {
        // Try previous close endpoint first (most reliable for free tier)
        try {
            $response = $client->get("/v2/aggs/ticker/{$symbol}/prev", [
                'query' => [
                    'adjusted' => 'true',
                    'apikey' => $apiKey,
                ],
                'timeout' => 10
            ]);
            
            $body = json_decode($response->getBody(), true);
            
            if (isset($body['results'][0])) {
                $result = $body['results'][0];
                
                return [
                    'ticker' => $symbol,
                    'day' => [
                        'o' => $result['o'], // open
                        'h' => $result['h'], // high
                        'l' => $result['l'], // low
                        'c' => $result['c'], // close
                        'v' => $result['v'], // volume
                    ],
                    'lastTrade' => [
                        'p' => $result['c'], // use close as last price
                        't' => $result['t'], // timestamp
                    ]
                ];
            }
        } catch (\Exception $e) {
            // Log the specific error for debugging
            Log::debug("Previous close failed for {$symbol}: " . $e->getMessage());
        }
        
        // Fallback: Try daily bars endpoint
        try {
            $yesterday = now()->subDay()->format('Y-m-d');
            
            $response = $client->get("/v2/aggs/ticker/{$symbol}/range/1/day/{$yesterday}/{$yesterday}", [
                'query' => [
                    'adjusted' => 'true',
                    'apikey' => $apiKey,
                ],
                'timeout' => 10
            ]);
            
            $body = json_decode($response->getBody(), true);
            
            if (isset($body['results'][0])) {
                $result = $body['results'][0];
                
                return [
                    'ticker' => $symbol,
                    'day' => [
                        'o' => $result['o'],
                        'h' => $result['h'],
                        'l' => $result['l'],
                        'c' => $result['c'],
                        'v' => $result['v'],
                    ],
                    'lastTrade' => [
                        'p' => $result['c'],
                        't' => $result['t'],
                    ]
                ];
            }
        } catch (\Exception $e) {
            Log::debug("Daily bars failed for {$symbol}: " . $e->getMessage());
        }
        
        return null;
    }
    
    /**
     * Display market data in a formatted table
     */
    private function displayMarketData(array $tickers)
    {
        $headers = ['Symbol', 'Price', 'Change', 'Change %', 'Volume', 'Updated'];
        $rows = [];
        
        foreach ($tickers as $ticker) {
            $lastTrade = $ticker['lastTrade'] ?? [];
            $day = $ticker['day'] ?? [];
            
            // Calculate percentage change: (close-open)/open*100 if open > 0
            $changePct = null;
            if (!empty($day['o']) && $day['o'] != 0) {
                $changePct = round((($day['c'] - $day['o']) / $day['o']) * 100, 2);
            }
            
            $rows[] = [
                $ticker['ticker'] ?? 'N/A',
                '$' . number_format($lastTrade['p'] ?? 0, 2),
                number_format(($day['c'] ?? 0) - ($day['o'] ?? 0), 2),
                $changePct ? $changePct . '%' : 'N/A',
                number_format($day['v'] ?? 0),
                now()->format('Y-m-d H:i:s T')
            ];
        }
        
        $this->table($headers, $rows);
    }
    
    /**
     * Store market data in database and ensure tickers exist
     */
    private function storeMarketData(array $tickers)
    {
        $storedCount = 0;
        $newTickersCount = 0;
        
        foreach ($tickers as $ticker) {
            $symbol = strtoupper($ticker['ticker']);
            $lastTrade = $ticker['lastTrade'] ?? [];
            $day = $ticker['day'] ?? [];
            
            // Ensure ticker exists in tickers table
            $tickerModel = Ticker::firstOrCreate(
                ['symbol' => $symbol],
                ['name' => null] // You can enhance this later with company names
            );
            
            if ($tickerModel->wasRecentlyCreated) {
                $newTickersCount++;
            }
            
            // Calculate percentage change
            $changePct = null;
            if (!empty($day['o']) && $day['o'] != 0 && !empty($day['c'])) {
                $changePct = round((($day['c'] - $day['o']) / $day['o']) * 100, 4);
            }
            
            // Store market data
            MarketData::create([
                'symbol' => $symbol,
                'price' => $lastTrade['p'] ?? null,
                'change' => isset($day['c'], $day['o']) ? ($day['c'] - $day['o']) : null,
                'change_pct' => $changePct,
                'volume' => $day['v'] ?? null,
                'open' => $day['o'] ?? null,
                'high' => $day['h'] ?? null,
                'low' => $day['l'] ?? null,
                'close' => $day['c'] ?? null,
                'market_timestamp' => isset($lastTrade['t']) ? 
                    Carbon::createFromTimestampMs($lastTrade['t']) : null,
            ]);
            
            $storedCount++;
        }
        
        $this->info("Market data stored: {$storedCount} records");
        if ($newTickersCount > 0) {
            $this->info("New tickers added: {$newTickersCount}");
        }
    }
}
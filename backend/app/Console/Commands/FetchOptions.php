<?php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use GuzzleHttp\Client;
use App\Models\OptionPosition;
use Carbon\Carbon;

class FetchOptions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fetch:options {ticker}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch call option chains for a ticker from Polygon.io';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $ticker = strtoupper($this->argument('ticker'));
        $this->info("Fetching options for {$ticker} from Polygon.io...");

        $apiKey = config('services.plygn.key');
        
        if (!$apiKey) {
            $this->error("Polygon API key not found in config. Please check your .env file.");
            return 1;
        }

        $client = new Client();
        
        // First, get available expiration dates
        $contractsUrl = "https://api.polygon.io/v3/reference/options/contracts";
        
        try {
            $response = $client->get($contractsUrl, [
                'query' => [
                    'underlying_ticker' => $ticker,
                    'contract_type' => 'call',
                    'limit' => 1000,
                    'apikey' => $apiKey
                ]
            ]);
        } catch (\Exception $e) {
            $this->error("HTTP error fetching option contracts: " . $e->getMessage());
            return 1;
        }

        $contractsData = json_decode($response->getBody()->getContents(), true);
        
        if (!isset($contractsData['results']) || empty($contractsData['results'])) {
            $this->error("No option contracts found for {$ticker}");
            return 1;
        }

        // Group contracts by expiration date
        $expirationDates = [];
        foreach ($contractsData['results'] as $contract) {
            $expiry = $contract['expiration_date'] ?? null;
            if ($expiry) {
                $expirationDates[$expiry][] = $contract;
            }
        }

        // Clear existing positions
        OptionPosition::where('ticker', $ticker)->delete();

        $totalCalls = 0;

        // For each expiration date, process contracts
        foreach ($expirationDates as $expiry => $contracts) {
            $contractCount = count($contracts);
            $this->info("Processing expiry: {$expiry} ({$contractCount} contracts)");
            
            // Process contracts for this expiry
            foreach ($contracts as $contract) {
                $optionTicker = $contract['ticker'];
                $strike = $contract['strike_price'];
                $lastPrice = 0; // Default to 0 for free tier
                
                // Try to get market data (will likely fail on free tier)
                try {
                    // Try the snapshot endpoint first (more likely to work on free tier)
                    $snapshotUrl = "https://api.polygon.io/v3/snapshot/options/{$ticker}";
                    $snapshotResponse = $client->get($snapshotUrl, [
                        'query' => [
                            'contract_type' => 'call',
                            'expiration_date' => $expiry,
                            'strike_price' => $strike,
                            'apikey' => $apiKey
                        ],
                        'timeout' => 10
                    ]);
                    
                    $snapshotData = json_decode($snapshotResponse->getBody()->getContents(), true);
                    
                    if (isset($snapshotData['results'][0])) {
                        $optionData = $snapshotData['results'][0];
                        
                        // Try different price fields that might be available
                        if (isset($optionData['last_quote']['price'])) {
                            $lastPrice = $optionData['last_quote']['price'];
                        } elseif (isset($optionData['last_trade']['price'])) {
                            $lastPrice = $optionData['last_trade']['price'];
                        } elseif (isset($optionData['market_status']) && $optionData['market_status'] === 'open') {
                            // If market is open but no price, try mid-point of bid/ask
                            $bid = $optionData['last_quote']['bid'] ?? 0;
                            $ask = $optionData['last_quote']['ask'] ?? 0;
                            if ($bid > 0 && $ask > 0) {
                                $lastPrice = ($bid + $ask) / 2;
                            }
                        }
                    }
                    
                } catch (\Exception $e) {
                    // Check if it's an authorization error
                    if (strpos($e->getMessage(), '403') !== false || strpos($e->getMessage(), 'NOT_AUTHORIZED') !== false) {
                        if ($totalCalls === 0) {
                            $this->warn("Free tier API key detected - market data not available. Creating contracts with $0 premiums.");
                        }
                    } else {
                        $this->warn("API error for {$optionTicker}: " . substr($e->getMessage(), 0, 100) . "...");
                    }
                }
                
                // Create the option position record
                OptionPosition::create([
                    'ticker' => $ticker,
                    'strike' => $strike,
                    'expiry' => $expiry,
                    'premium_received' => $lastPrice,
                    'contracts' => 1,
                ]);
                
                $totalCalls++;
                
                // Rate limiting - be gentle with the API
                usleep(200000); // 0.2 second delay between requests
            }
        }

        $count = OptionPosition::where('ticker', $ticker)->count();
        
        if ($totalCalls > 0 && $count > 0) {
            $withPricing = OptionPosition::where('ticker', $ticker)
                ->where('premium_received', '>', 0)
                ->count();
            
            $this->info("Option positions updated for {$ticker}. Total calls: {$count}");
            
            if ($withPricing === 0) {
                $this->warn("Note: No pricing data available with free tier API key. All premiums set to $0.");
                $this->warn("Consider upgrading to Polygon paid tier for real-time pricing, or use Tradier's free developer account.");
            } else {
                $this->info("Successfully retrieved pricing for {$withPricing} out of {$count} contracts.");
            }
        } else {
            $this->error("No option contracts were processed successfully.");
            return 1;
        }
        
        return 0;
    }
}
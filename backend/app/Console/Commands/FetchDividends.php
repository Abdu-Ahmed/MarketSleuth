<?php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use GuzzleHttp\Client;
use App\Models\DividendRecord;

class FetchDividends extends Command
{
    protected $signature = 'fetch:dividends {ticker}';
    protected $description = 'Fetch recent dividends for a ticker from Financial Modeling Prep';

    public function handle()
    {
        $ticker = strtoupper($this->argument('ticker'));
        $this->info("Fetching dividends for {$ticker} from Financial Modeling Prep...");

        $apiKey = config('services.fmp.key');
        
        if (!$apiKey) {
            $this->error("FMP API key not found in config. Please check your .env file.");
            return 1;
        }

        $client = new Client(['base_uri' => 'https://financialmodelingprep.com']);
        
        try {
            $response = $client->get("/api/v3/historical-price-full/stock_dividend/{$ticker}?apikey={$apiKey}");
        } catch (\Exception $e) {
            $this->error("HTTP error fetching dividends: " . $e->getMessage());
            return 1;
        }

        if ($response->getStatusCode() !== 200) {
            $this->error("FMP responded with status " . $response->getStatusCode());
            return 1;
        }

        $responseBody = $response->getBody()->getContents();
        $data = json_decode($responseBody, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->error("Invalid JSON response from FMP: " . json_last_error_msg());
            return 1;
        }

        $records = $data['historical'] ?? [];

        if (empty($records)) {
            $this->warn("No dividend records found for {$ticker}");
            return 0;
        }

        $successCount = 0;
        $errorCount = 0;

        foreach ($records as $entry) {
            try {
                // Validate required fields
                if (!isset($entry['date']) || !isset($entry['dividend'])) {
                    $this->warn("Skipping incomplete dividend record: " . json_encode($entry));
                    $errorCount++;
                    continue;
                }

                // Validate date format
                if (!$this->isValidDate($entry['date'])) {
                    $this->warn("Skipping record with invalid date format: " . $entry['date']);
                    $errorCount++;
                    continue;
                }

                // Validate payment date if provided
                $payDate = $entry['paymentDate'] ?? null;
                if ($payDate && !$this->isValidDate($payDate)) {
                    $this->warn("Invalid payment date format for {$entry['date']}, setting to null: " . $payDate);
                    $payDate = null;
                }

                // Validate dividend amount
                if (!is_numeric($entry['dividend']) || $entry['dividend'] < 0) {
                    $this->warn("Skipping record with invalid dividend amount: " . $entry['dividend']);
                    $errorCount++;
                    continue;
                }

                DividendRecord::updateOrCreate(
                    ['ticker' => $ticker, 'ex_date' => $entry['date']],
                    [
                        'amount' => (float) $entry['dividend'], 
                        'pay_date' => $payDate
                    ]
                );

                $successCount++;

            } catch (\Exception $e) {
                $this->error("Error processing dividend record: " . $e->getMessage());
                $errorCount++;
            }
        }

        if ($successCount > 0) {
            $this->info("Dividend records updated for {$ticker}. Successfully processed: {$successCount}");
        }

        if ($errorCount > 0) {
            $this->warn("Encountered {$errorCount} errors while processing records.");
        }

        $totalRecords = DividendRecord::where('ticker', $ticker)->count();
        $this->info("Total dividend records for {$ticker}: {$totalRecords}");

        return 0;
    }

    /**
     * Validate if a date string is in the correct format (YYYY-MM-DD)
     */
    private function isValidDate($date)
    {
        if (!is_string($date)) {
            return false;
        }

        $dateTime = \DateTime::createFromFormat('Y-m-d', $date);
        return $dateTime && $dateTime->format('Y-m-d') === $date;
    }
}
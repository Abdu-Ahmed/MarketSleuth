<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Scanner;
use App\Models\ScannerResult;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class RunScanner extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'scan:run {scanner_id}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Execute a saved stock scanner and store results';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $id = $this->argument('scanner_id');
        $scanner = Scanner::find($id);

        if (! $scanner) {
            $this->error("❌ Scanner with ID {$id} not found.");
            return 1;
        }

        $criteria = $scanner->criteria;
        $this->info("🔍 Running scanner: '{$scanner->name}' (ID: {$id})...");

        try {
            $query = DB::table('tickers')->select('symbol');

            // Dividend Yield Filter
            if (!empty($criteria['dividendYield'])) {
                ['operator' => $op, 'value' => $val] = $criteria['dividendYield'];
                $this->info("– Applying dividend yield filter: {$op} {$val}");
                $query->join('dividend_records', 'tickers.symbol', '=', 'dividend_records.ticker')
                      ->groupBy('tickers.symbol')
                      ->havingRaw("AVG(dividend_records.amount) {$op} ?", [$val]);
            }

            // Insider Buys Filter
            if (!empty($criteria['insiderBuysLastDays'])) {
                $days = (int) $criteria['insiderBuysLastDays'];
                $since = Carbon::now()->subDays($days)->toDateString();
                $this->info("– Applying insider buys filter: last {$days} days since {$since}");
                $query->join('form4_records', 'tickers.symbol', '=', 'form4_records.ticker')
                      ->where('form4_records.filed_at', '>=', $since)
                      ->groupBy('tickers.symbol')
                      ->havingRaw('COUNT(*) > 0');
            }

            // Execute query
            $symbols = $query->pluck('symbol')->toArray();

        } catch (\Exception $e) {
            $this->error("❌ Error building scan query: " . $e->getMessage());
            return 1;
        }

        // Delete old results
        ScannerResult::where('scanner_id', $id)->delete();

        if (empty($symbols)) {
            $this->warn("⚠️ No symbols matched the criteria.");
        } else {
            $now = Carbon::now();
            foreach ($symbols as $symbol) {
                ScannerResult::create([
                    'scanner_id' => $id,
                    'ticker'     => $symbol,
                    'matched_at' => $now,
                ]);
            }
            $this->info("✅ Found " . count($symbols) . " tickers: " . implode(', ', $symbols));
        }

        return 0;
    }
}

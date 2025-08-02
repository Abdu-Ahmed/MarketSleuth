<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Ticker;
use App\Models\DividendRecord;
use App\Models\Form4Record;
use Carbon\Carbon;

class ComputeTickerMetrics extends Command
{
    protected $signature = 'compute:metrics';
    protected $description = 'Compute avg dividend yield & insider buys for all tickers';

    public function handle()
    {
        $this->info('Starting metrics computation...');
        Ticker::chunk(100, function($tickers) {
            foreach ($tickers as $ticker) {
                $sym = $ticker->symbol;

                // 1) Average dividend yield (last 12 months):
                $divs = DividendRecord::where('ticker', $sym)
                    ->where('ex_date', '>=', Carbon::now()->subYear())
                    ->pluck('amount');
                $avgYield = $divs->sum() / 12;

                // 2) Insider buys in last 90 days:
                $count = Form4Record::where('ticker', $sym)
                    ->where('transaction_type', 'Buy')
                    ->where('filed_at', '>=', Carbon::now()->subDays(90))
                    ->count();

                // Update:
                $ticker->update([
                    'avg_dividend_yield' => round($avgYield, 2),
                    'insider_buys_90d'   => $count,
                ]);
            }
        });
        $this->info('Metrics computation complete.');
    }
}

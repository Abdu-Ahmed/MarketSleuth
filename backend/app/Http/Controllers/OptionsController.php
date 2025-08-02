<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\OptionPosition;
use App\Http\Controllers\MarketDataController;


class OptionsController extends Controller
{
    /**
     * Simulate P/L for a saved option position.
     *
     * POST /api/options/simulate
     * {
     *   "ticker": "AAPL",
     *   "expiry": "2025-08-21",
     *   "strike": 160
     * }
     */
    public function simulate(Request $request)
    {
        $data = $request->validate([
            'ticker' => 'required|string|exists:option_positions,ticker',
            'expiry' => 'required|date',
            'strike' => 'required|numeric',
        ]);

        $ticker = strtoupper($data['ticker']);
        $expiry = $data['expiry'];
        $strike = $data['strike'];

        // 1) Fetch the saved OptionPosition
        $pos = OptionPosition::where('ticker', $ticker)
            ->where('expiry', $expiry)
            ->where('strike', $strike)
            ->first();

        if (! $pos) {
            return response()->json([
                'error' => "No saved position for {$ticker} @ \${$strike} exp {$expiry}"
            ], 404);
        }

        // how many shares does this represent?
        $contracts      = $pos->contracts;           
        $shares         = $contracts * 100;         
        $premiumPerCtr  = $pos->premium_received;     
        $totalPremium   = $premiumPerCtr * $contracts;

        // 2) Fetch current underlying price via MarketDataController
        $mdc = app(MarketDataController::class);
        $tickerData = $mdc->getTicker($ticker);
        // getTicker returns a JSON response; unwrap it:
        $priceNow = data_get($tickerData, 'price');
        if (! is_numeric($priceNow)) {
            return response()->json([
                'error' => "Unable to fetch current price for {$ticker}"
            ], 500);
        }

        // 3) Build a P/L grid around strike +/- 50%
        $min = max(0, $strike * 0.5);
        $max = $strike * 1.5;
        $steps = 40;
        $stepSize = ($max - $min) / $steps;

        $pnlGrid = [];
        for ($i = 0; $i <= $steps; $i++) {
            $u = round($min + $i * $stepSize, 2);
            // intrinsic at expiry for a call
            $intrinsic = max(0, $u - $strike) * $shares;
            // cost basis change: (current intrinsic at now vs intrinsic at expiry)
            $intrinsicNow = max(0, $priceNow - $strike) * $shares;
            // P/L = (intrinsic at expiry – intrinsic now) + premium received
            $pl = $intrinsic - $intrinsicNow + $totalPremium;

            $pnlGrid[] = [
                'underlying' => $u,
                'pl'         => round($pl, 2),
            ];
        }

        return response()->json([
            'ticker'         => $ticker,
            'expiry'         => $expiry,
            'strike'         => $strike,
            'contracts'      => $contracts,
            'premium_per_ctr'=> $premiumPerCtr,
            'total_premium'  => $totalPremium,
            'price_now'      => $priceNow,
            'pnl_grid'       => $pnlGrid,
        ]);
    }
}

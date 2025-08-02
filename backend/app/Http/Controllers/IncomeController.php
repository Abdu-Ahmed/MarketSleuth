<?php
namespace App\Http\Controllers;
use App\Models\DividendRecord;
use App\Models\OptionPosition;

class IncomeController extends Controller
{
    public function dividends(string $symbol)
    {
        $symbol = strtoupper($symbol);
        $records = DividendRecord::where('ticker', $symbol)
            ->orderBy('ex_date','desc')->get(['amount','ex_date']);
        $total = $records->sum('amount');
        return response()->json([  
            'symbol'  => $symbol,
            'total'   => round($total,4),
            'monthly' => round($total/12,4),
            'records' => $records,
        ]);
    }

public function options(string $symbol)
{
    $symbol = strtoupper($symbol);
    $positions = OptionPosition::where('ticker', $symbol)->get();

    $income = $positions->sum(fn($p) => $p->premium_received * $p->contracts);

    $contractsCount = $positions->sum('contracts');
    // Avoid division by zero
    $yield = $contractsCount > 0
        ? round(($income / ($contractsCount * 100 * 100)) * 100, 2)
        : 0.00;

    return response()->json(compact('symbol', 'positions', 'income', 'yield'));
}
}
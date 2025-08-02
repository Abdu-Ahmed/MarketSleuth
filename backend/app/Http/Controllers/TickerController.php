<?php
namespace App\Http\Controllers;

use App\Models\Form4Record;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class TickerController extends Controller
{
    /**
     * Get insider trading data
     */
    public function insiders(string $symbol)
    {
        $symbol = strtoupper($symbol);

        $count = Form4Record::where('ticker', $symbol)->count();
        $latest = Form4Record::where('ticker', $symbol)
            ->orderBy('filed_at', 'desc')
            ->limit(5)
            ->get(['filer_name', 'transaction_type', 'filed_at']);

        return response()->json(compact('symbol', 'count', 'latest'));
    }
}
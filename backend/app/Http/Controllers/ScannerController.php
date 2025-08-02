<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Ticker;
use App\Models\Scanner;
use App\Models\ScannerResult;
use Illuminate\Support\Facades\Auth;

class ScannerController extends Controller
{
    // GET /api/scanners/high-dividend
    public function highDividend()
    {
        $tickers = Ticker::where('avg_dividend_yield', '>=', 4.0)
            ->orderByDesc('avg_dividend_yield')
            ->get(['symbol','avg_dividend_yield','insider_buys_90d']);
        return response()->json($tickers);
    }

    // GET /api/scanners/insider-activity
    public function insiderActivity()
    {
        $tickers = Ticker::where('insider_buys_90d', '>', 0)
            ->orderByDesc('insider_buys_90d')
            ->get(['symbol','insider_buys_90d','avg_dividend_yield']);
        return response()->json($tickers);
    }

        /**
     * GET /api/scanners
     * List all scanners for authenticated user
     */
    public function index()
    {
        $user = Auth::user();
        $scanners = Scanner::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get(['id', 'name', 'criteria', 'created_at']);

        return response()->json($scanners);
    }

    /**
     * POST /api/scanners
     * Create a new scanner
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'criteria' => 'required|array',
        ]);

        $scanner = Scanner::create([
            'user_id'  => Auth::id(),
            'name'     => $data['name'],
            'criteria' => $data['criteria'],
        ]);

        return response()->json($scanner, 201);
    }

    /**
     * GET /api/scanners/{id}/results
     * Get latest results for a scanner
     */
    public function results($id)
    {
        $scanner = Scanner::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $results = ScannerResult::where('scanner_id', $scanner->id)
            ->orderBy('matched_at', 'desc')
            ->get(['ticker', 'matched_at']);

        return response()->json([
            'scanner' => $scanner,
            'results' => $results,
        ]);
    }
}

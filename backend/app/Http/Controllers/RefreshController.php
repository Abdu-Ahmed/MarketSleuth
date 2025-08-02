<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;

class RefreshController extends Controller
{
    /**
     * Kick off all the artisan fetch jobs.
     * POST /api/refresh-data
     */
    public function refreshAll(Request $request)
    {
        // You can queue these or run sequentially
        Artisan::call('fetch:form4 AAPL');
        Artisan::call('fetch:dividends AAPL');
        Artisan::call('fetch:options AAPL');
        Artisan::call('fetch:events');
        Artisan::call('scan:run 1');   // your scanner #1, etc.

        return response()->json([
            'message' => 'Refresh kicked off',
        ], 202);
    }
}

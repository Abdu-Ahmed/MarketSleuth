<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Earning;
use App\Models\AnalystAction;
use App\Models\Event;
use Carbon\Carbon;

class EventController extends Controller
{
    /**
     * GET /api/events/earnings/upcoming
     * Return all earnings in the next N days (default 7).
     */
    public function earningsUpcoming(Request $request)
    {
        $days = (int) $request->query('days', 7);
        $start = Carbon::today();
        $end   = $start->copy()->addDays($days);

        $earnings = Earning::whereBetween('report_date', [$start, $end])
            ->orderBy('report_date')
            ->get();

        return response()->json([
            'from'     => $start->toDateString(),
            'to'       => $end->toDateString(),
            'earnings' => $earnings,
        ]);
    }

    /**
     * GET /api/events/analyst/{symbol}
     * Return recent analyst upgrades/downgrades for a given symbol.
     */
    public function analystBySymbol($symbol)
    {
        $actions = AnalystAction::where('symbol', strtoupper($symbol))
            ->orderByDesc('action_date')
            ->get();

        return response()->json([
            'symbol'   => strtoupper($symbol),
            'actions'  => $actions,
        ]);
    }

    /**
     * GET /api/events/all
     * Return a mixed feed of conferences, 13F, etc., optionally filtered by type.
     */
    public function all(Request $request)
    {
        $type = $request->query('type');  // e.g. 'conference', '13f'
        $query = Event::query();

        if ($type) {
            $query->where('type', $type);
        }

        $events = $query
            ->orderByDesc('event_date')
            ->paginate(50);

        return response()->json($events);
    }
}

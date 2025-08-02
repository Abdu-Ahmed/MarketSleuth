<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\JournalEntry;
use Illuminate\Support\Facades\Auth;

class JournalController extends Controller
{
    // GET /api/journal
    public function index()
    {
        $entries = JournalEntry::where('user_id', Auth::id())
            ->orderBy('created_at','desc')
            ->get();
        return response()->json($entries);
    }

    // POST /api/journal
    public function store(Request $r)
    {
        $data = $r->validate([
            'ticker' => 'required|string|max:10',
            'type'   => 'required|in:buy,sell,note',
            'quantity' => 'nullable|numeric',
            'price'    => 'nullable|numeric',
            'pl'       => 'nullable|numeric',
            'tags'     => 'nullable|array',
            'notes'    => 'nullable|string',
            'attachment_url' => 'nullable|url'
        ]);

        $data['user_id'] = Auth::id();
        $entry = JournalEntry::create($data);
        return response()->json($entry,201);
    }

    // GET /api/journal/{id}
    public function show($id)
    {
        $entry = JournalEntry::where('id',$id)
            ->where('user_id',Auth::id())
            ->firstOrFail();
        return response()->json($entry);
    }

    // DELETE /api/journal/{id}
    public function destroy($id)
    {
        JournalEntry::where('id',$id)
            ->where('user_id',Auth::id())
            ->delete();
        return response()->json(null,204);
    }
}

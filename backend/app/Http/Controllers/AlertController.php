<?php

namespace App\Http\Controllers;

use App\Models\Alert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AlertController extends Controller
{
    public function index()
    {
        return response()->json(
            Auth::user()->alerts()->orderByDesc('created_at')->get()
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'type'       => 'required|in:earnings,insider,dividend',
            'symbol'     => 'nullable|string|max:10',
            'config'     => 'required|array',
            'config.*'   => 'sometimes|required',
            'active'     => 'boolean',
        ]);
        $data['user_id'] = Auth::id();
        $alert = Alert::create($data);
        return response()->json($alert, 201);
    }

    public function update(Request $request, $id)
    {
        $alert = Auth::user()->alerts()->findOrFail($id);
        $data  = $request->validate([
            'symbol'   => 'sometimes|string|max:10',
            'config'   => 'sometimes|array',
            'active'   => 'sometimes|boolean',
        ]);
        $alert->update($data);
        return response()->json($alert);
    }

    public function destroy($id)
    {
        $alert = Auth::user()->alerts()->findOrFail($id);
        $alert->delete();
        return response()->json(null, 204);
    }
}

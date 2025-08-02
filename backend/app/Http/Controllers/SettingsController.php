<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class SettingsController extends Controller
{
    // GET /api/settings/profile
    public function profile()
    {
        $user = Auth::user();
        return response()->json([
          'name'  => $user->name,
          'email' => $user->email,
        ]);
    }

    // PUT /api/settings/profile
    public function updateProfile(Request $req)
    {
        $user = Auth::user();
        $data = $req->validate([
          'name'  => 'required|string|max:255',
          'email' => ['required','email','max:255', Rule::unique('users')->ignore($user->id)],
        ]);
        $user->update($data);
        return response()->json(['message'=>'Profile updated','name'=>$user->name,'email'=>$user->email]);
    }

    // PUT /api/settings/password
    public function changePassword(Request $req)
    {
        $user = Auth::user();
        $req->validate([
          'current_password'      => 'required|string',
          'password'              => 'required|string|min:12|confirmed',
        ]);
        if (!Hash::check($req->current_password, $user->password)) {
          return response()->json(['error'=>'Current password is incorrect'], 422);
        }
        $user->password = Hash::make($req->password);
        $user->save();
        return response()->json(['message'=>'Password changed successfully']);
    }
}

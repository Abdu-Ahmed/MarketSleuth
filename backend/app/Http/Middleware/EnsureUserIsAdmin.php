<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        // assuming you have an `is_admin` boolean column on users
        if (! $user ||  $user->role !== 'admin') {
            return response()->json(['error'=>'Forbidden'], 403);
        }
        return $next($request);
    }
}

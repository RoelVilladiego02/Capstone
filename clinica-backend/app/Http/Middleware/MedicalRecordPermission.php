<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class MedicalRecordPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth()->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Check if user has any of the authorized roles
        $authorizedRoles = ['Doctor', 'Admin', 'Nurse', 'Medical Staff'];
        $userRoles = $user->roles->pluck('name')->toArray();
        
        if (!array_intersect($authorizedRoles, $userRoles)) {
            return response()->json([
                'message' => 'Insufficient permissions to manage medical records. Only authorized medical staff can perform this action.'
            ], 403);
        }

        return $next($request);
    }
} 
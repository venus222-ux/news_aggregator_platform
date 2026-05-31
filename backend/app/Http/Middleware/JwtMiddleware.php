<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;

class JwtMiddleware
{
public function handle(Request $request, Closure $next): Response
{
    try {
        $token = $request->bearerToken();

        if (empty($token)) {
            return response()->json(['message' => 'Token not provided'], 401);
        }

        JWTAuth::setToken($token);
        $user = JWTAuth::authenticate();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 401);
        }

        // Best practice for Laravel Broadcasting + JWT
        $request->setUserResolver(function () use ($user) {
            return $user;
        });

        auth()->setUser($user);        // Try anyway
        auth('api')->setUser($user);

        Log::info('Broadcasting Auth SUCCESS for user: ' . $user->id);

        return $next($request);

    } catch (\Throwable $e) {
        Log::error('Broadcasting JWT Error: ' . $e->getMessage());
        return response()->json(['message' => 'Unauthorized'], 401);
    }
}
}

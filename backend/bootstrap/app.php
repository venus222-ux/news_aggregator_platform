<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\HandleCors;

// bootstrap/app.php

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    // 🔥 ADD THIS BLOCK HERE
    ->withBroadcasting(
        __DIR__.'/../routes/channels.php',
        ['prefix' => 'api', 'middleware' => ['auth.jwt']],
    )

    ->withMiddleware(function (Middleware $middleware): array {

    // Global middleware
    $middleware->use([
        \Illuminate\Http\Middleware\HandleCors::class,
        \Illuminate\Foundation\Http\Middleware\TrimStrings::class,
        \Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull::class,
    ]);

    // API group
    $middleware->group('api', [
        \Illuminate\Routing\Middleware\SubstituteBindings::class,
        \Illuminate\Routing\Middleware\ThrottleRequests::class . ':api',
    ]);

    // JWT alias
    $middleware->alias([
        'auth.jwt' => \App\Http\Middleware\JwtMiddleware::class,
        'admin' => \App\Http\Middleware\AdminMiddleware::class,
    ]);

    // Optional: return array of additional global middleware
    return [];
})

    ->withExceptions(function (Exceptions $exceptions): void {

        // Clean JSON errors for API
        $exceptions->render(function (Throwable $e, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage(),
                ], method_exists($e, 'getStatusCode') ? $e->getStatusCode() : 500);
            }

            return null;
        });

    })

    ->create();

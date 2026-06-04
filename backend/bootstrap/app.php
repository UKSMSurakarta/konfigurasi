<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Global CORS middleware – runs on every request
        // Enable Sanctum's first-party SPA session authentication.
        $middleware->statefulApi();

        $middleware->prepend(\App\Http\Middleware\CorsMiddleware::class);

        // Security Headers – runs on every response
        $middleware->append(\App\Http\Middleware\SecurityHeaders::class);

        $middleware->alias([
            'role' => \App\Http\Middleware\CheckRole::class,
            'cors' => \App\Http\Middleware\CorsMiddleware::class,
            'protect_health_check' => \App\Http\Middleware\ProtectHealthCheck::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();

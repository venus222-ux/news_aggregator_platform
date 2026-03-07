<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\CategoryController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Protected routes with auth + throttle
Route::middleware(['auth:api', 'throttle:60,1'])->group(function () {
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/dashboard', function () {
        return response()->json(['message' => 'User Dashboard']);
    });

    Route::get('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::delete('/profile', [AuthController::class, 'destroyProfile']);
    Route::post('/refresh', [AuthController::class, 'refresh']);


    //Category
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/subscriptions', [CategoryController::class, 'mySubscriptions']);
    Route::post('/categories/{category}/subscribe', [CategoryController::class, 'subscribe']);
    Route::delete('/categories/{category}/unsubscribe', [CategoryController::class, 'unsubscribe']);


    Route::middleware(['admin'])->group(function () {
        Route::get('/admin/dashboard', [AdminController::class, 'dashboard']);

        //Category
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{category}', [CategoryController::class, 'update']);
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);
    });
});



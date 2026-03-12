<?php

use App\Http\Controllers\Admin\AnalyticsController;
use App\Http\Controllers\Admin\NewsController;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\Admin\SourceController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FeedController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);


Route::middleware(['auth:api', 'throttle:60,1'])->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'stats']);
});

// Protected routes with auth + throttle
Route::middleware(['auth:api', 'throttle:60,1'])->group(function () {
    Route::get('/me', [AuthController::class, 'me']);



    Route::get('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::delete('/profile', [AuthController::class, 'destroyProfile']);
    Route::post('/refresh', [AuthController::class, 'refresh']);

    Route::get('/feed/discover', [FeedController::class, 'discoverFeed']);



    //Category
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/subscriptions', [CategoryController::class, 'mySubscriptions']);
    Route::post('/categories/{category}/subscribe', [CategoryController::class, 'subscribe']);
    Route::delete('/categories/{category}/unsubscribe', [CategoryController::class, 'unsubscribe']);

    //Article
    Route::get('/articles', [ArticleController::class, 'index']); // user subscriptions
    Route::get('/articles/all', [ArticleController::class, 'all']); // admin or explore

   Route::get('/articles/search', [ArticleController::class, 'search']);

    //personalized feed API for subscribed categories.
    Route::get('/feed', [FeedController::class, 'index']);

  Route::middleware(['admin'])->group(function () {

    Route::get('/admin/dashboard', [AdminController::class, 'dashboard']);

    // categories
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{category}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

    // news fetch
    Route::post('/admin/fetch-news', [NewsController::class, 'fetchNow']);

    // sources
    Route::get('/admin/sources', [SourceController::class, 'index']);
    Route::post('/admin/sources', [SourceController::class, 'store']);
    Route::put('/admin/sources/{source}', [SourceController::class, 'update']);
    Route::delete('/admin/sources/{source}', [SourceController::class, 'destroy']);

    Route::get('/admin/latest-articles', [ArticleController::class, 'latestAdmin']);

    Route::get('/admin/analytics/article-stats', [AnalyticsController::class, 'articleStats']);
    Route::get('admin/analytics/article-stats-by-category', [AnalyticsController::class, 'articleStatsByCategory']);
});

Route::middleware('auth:api')->group(function () {
    Route::get('/notifications/unread', [NotificationController::class, 'unreadCount']);
    Route::post('/notifications/mark-read', [NotificationController::class, 'markRead']);
});


});



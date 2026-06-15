<?php

use App\Http\Controllers\Admin\AnalyticsController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\Admin\SourceController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FeedController;
use Illuminate\Support\Facades\Broadcast;

Broadcast::routes([
    'middleware' => ['auth:api'],
]);

/* ========================================================
   🔓 PUBLIC ROUTES
   ======================================================== */
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
Route::post('/refresh', [AuthController::class, 'refresh']); // 🧠 Handled outside jwt validation groups


/* ========================================================
   🔒 PROTECTED ROUTES (USER & GENERAL)
   ======================================================== */
Route::middleware(['jwt.auth', 'throttle:60,1'])->group(function () {

    // Profile
    Route::get('/logout', [AuthController::class, 'logout']); // 💡 Tip: Standardize logout to POST on frontend if possible
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::delete('/profile', [AuthController::class, 'destroyProfile']);
    Route::get('/me', [AuthController::class, 'me']);

    // Feed
    Route::get('/feed', [FeedController::class, 'index']);
    Route::get('/feed/discover', [FeedController::class, 'discoverFeed']);

    // Category
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/subscriptions', [CategoryController::class, 'mySubscriptions']);
    Route::post('/categories/{category}/subscribe', [CategoryController::class, 'subscribe']);
    Route::delete('/categories/{category}/unsubscribe', [CategoryController::class, 'unsubscribe']);

    // Article
    Route::get('/articles', [ArticleController::class, 'index']);
    Route::get('/articles/all', [ArticleController::class, 'all']);
    Route::get('/articles/search', [ArticleController::class, 'search']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'stats']);
    Route::get('/notifications/unread', [NotificationController::class, 'unreadCount']);
    Route::post('/notifications/mark-read', [NotificationController::class, 'markRead']);

    /* ========================================================
       👑 ADMIN-ONLY ROUTES
       ======================================================== */
    Route::prefix('admin')
        ->middleware(['role:admin'])
        ->group(function () {

            Route::get('/dashboard', [AdminController::class, 'dashboard']);
            Route::get('/users', [AdminController::class, 'users']);
            Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);

            // Categories Management
            Route::post('/categories', [CategoryController::class, 'store']);
            Route::put('/categories/{category}', [CategoryController::class, 'update']);
            Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

            // News Engine Fetching
            Route::post('/fetch-news', [NewsController::class, 'fetchNow']); // 🛠️ Fixed structural typo 'f/etch-news'

            // Sources Management
            Route::get('/sources', [SourceController::class, 'index']);
            Route::post('/sources', [SourceController::class, 'store']);
            Route::put('/sources/{source}', [SourceController::class, 'update']);
            Route::delete('/sources/{source}', [SourceController::class, 'destroy']);

            // Articles & Analytics
            Route::get('/latest-articles', [ArticleController::class, 'latestAdmin']);
            Route::get('/analytics/article-stats', [AnalyticsController::class, 'articleStats']);
            Route::get('/analytics/article-stats-by-category', [AnalyticsController::class, 'articleStatsByCategory']);
        });
});

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Article;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class NotificationController extends Controller
{
   public function unreadCount()
{
    try {
        $user = Auth::user();
        if (!$user) throw new \Exception("No authenticated user.");

        // explicitly reference categories.id
        $categoryIds = $user->subscriptions()->pluck('categories.id')->toArray();

        $lastRead = $user->last_read_at ?? now()->subYear();

        $articles = Article::whereIn('category_id', $categoryIds)
            ->where('published_at', '>', $lastRead)
            ->orderBy('published_at', 'desc')
            ->get(['id', 'title', 'category_id', 'published_at']);

        $notifications = $articles->map(function($a) {
            return [
                'id' => (string) $a->id,
                'title' => $a->title,
                'url' => '/feed',
                'read' => false,
            ];
        });

        return response()->json([
            'count' => $notifications->count(),
            'notifications' => $notifications,
        ]);

    } catch (\Exception $e) {
        Log::error('Unread notifications failed: '.$e->getMessage());
        return response()->json(['error' => $e->getMessage()], 500);
    }
}

    public function markRead()
    {
        $user = Auth::user();
        if (!$user) return response()->json(['error' => 'No authenticated user.'], 401);

        $user->last_read_at = now();
        $user->save();

        return response()->json(['success' => true]);
    }
}

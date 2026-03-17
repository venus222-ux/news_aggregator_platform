<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Models\Article;
use Illuminate\Support\Facades\Schema;

class NotificationController extends Controller
{
public function unreadCount()
{
    try {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // 🔥 FIX: convert to string for MongoDB
        $categoryIds = $user->subscriptions()
            ->pluck('categories.id')
            ->map(fn ($id) => (string) $id)
            ->toArray();

        if (empty($categoryIds)) {
            return response()->json([
                'count' => 0,
                'notifications' => []
            ]);
        }

        $lastRead = $user->last_read_at ?? now()->subYear();

        $query = Article::whereIn('category_id', $categoryIds);

        if (!empty($lastRead)) {
            $query->where('published_at', '>', $lastRead);
        }

        $articles = $query
            ->orderBy('published_at', 'desc')
            ->limit(20)
            ->get(['_id', 'title']); // Mongo uses _id

        return response()->json([
            'count' => $articles->count(),
            'notifications' => $articles->map(fn ($a) => [
                'id' => (string) $a->_id, // 🔥 Mongo fix
                'title' => $a->title,
                'url' => '/feed',
                'read' => false,
            ])
        ]);

    } catch (\Throwable $e) {

        \Log::error('Notification ERROR', [
            'message' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ]);

        return response()->json([
            'message' => $e->getMessage()
        ], 500);
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

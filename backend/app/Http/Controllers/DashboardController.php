<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use App\Models\Article;
use App\Models\Category;

class DashboardController extends Controller
{
    public function stats()
    {
        $user = Auth::user();

        // ✅ 1. Get subscribed category IDs (force STRING for MongoDB)
        $categoryIds = $user->subscriptions()
            ->pluck('categories.id')
            ->map(fn($id) => (string) $id)
            ->toArray();

        // 🧪 DEBUG (optional)
        // \Log::info('User categories:', $categoryIds);

        // ✅ 2. Unread count
        $lastRead = $user->last_read_at ?? now()->subYear();

        $unreadCount = Article::whereIn('category_id', $categoryIds)
            ->where('published_at', '>', $lastRead)
            ->count();

        // ✅ 3. Recent articles
        $articlesQuery = Article::query();

        // If user has subscriptions → filter
        if (!empty($categoryIds)) {
            $articlesQuery->whereIn('category_id', $categoryIds);
        }

        // If NO subscriptions → show latest anyway (important UX)
        $recentArticles = $articlesQuery
            ->orderBy('published_at', 'desc')
            ->take(5)
            ->get();

        // ✅ 4. Map category names
        $recentArticles = $recentArticles->map(function ($a) {
            $categoryName = 'Uncategorized';

            if ($a->category_id) {
                $category = Category::find((int)$a->category_id);
                $categoryName = $category?->name ?? 'Uncategorized';
            }

            return [
                'id' => (string) ($a->_id ?? $a->id),
                'title' => $a->title,
                'url' => $a->url,
                'source' => $a->source ?? 'News', // ✅ FIXED
                'published_at' => $a->published_at,
                'category' => $categoryName,
            ];
        });

        return response()->json([
            'categoryCount' => count($categoryIds),
            'unreadNotifications' => $unreadCount,
            'recentArticles' => $recentArticles,
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Article;
use App\Models\Category;

class DashboardController extends Controller
{
    public function stats()
    {
        $user = Auth::user();

        // 1️⃣ Get the IDs of the categories the user is subscribed to
        $categoryIds = $user->subscriptions()->pluck('categories.id')->toArray();

        // 2️⃣ Unread articles since last read
        $lastRead = $user->last_read_at ?? now()->subYear();
        $unreadCount = Article::whereIn('category_id', $categoryIds)
            ->where('published_at', '>', $lastRead)
            ->count();

        // 3️⃣ Recent articles (latest 5)
        $recentArticles = Article::whereIn('category_id', $categoryIds)
            ->orderBy('published_at', 'desc')
            ->take(5)
            ->get();

        // 4️⃣ Map category names manually (MongoDB doesn't support Eloquent relations fully)
        $recentArticles = $recentArticles->map(function ($a) use ($categoryIds) {
            $categoryName = 'Uncategorized';
            if ($a->category_id) {
                $category = Category::find($a->category_id);
                $categoryName = $category?->name ?? 'Uncategorized';
            }

            return [
                'id' => $a->_id ?? $a->id, // MongoDB uses _id
                'title' => $a->title,
                'url' => $a->url,
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

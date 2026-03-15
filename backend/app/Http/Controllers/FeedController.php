<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class FeedController extends Controller
{
    // GET /api/feed?cursor=timestamp
    //feed is cached in Redis and will auto-expire after 5 minutes or be invalidated on updates.
public function index(Request $request)
{
    $user = Auth::user();

    if (!$user) {
        return response()->json(['message' => 'Unauthorized'], 401);
    }

    $validated = $request->validate([
        'cursor_date' => 'nullable|date',
        'cursor_id'   => 'nullable|string',
    ]);

    // 1. Get Subscription IDs and cast to Strings for MongoDB compatibility
    $subscriptions = $user->subscriptions()
        ->pluck('categories.id')
        ->map(fn($id) => (string) $id)
        ->toArray();

    $cursorDate = $validated['cursor_date'] ?? null;
    $cursorId   = $validated['cursor_id'] ?? null;

    // 2. Build the Query
    $query = Article::query();

    // Only filter by category if the user actually has subscriptions
    if (!empty($subscriptions)) {
        $query->whereIn('category_id', $subscriptions);
    }

    // 3. Cursor Pagination Logic
    if ($cursorDate && $cursorId) {
        $query->where(function ($q) use ($cursorDate, $cursorId) {
            $q->where('published_at', '<', $cursorDate)
              ->orWhere(function ($q2) use ($cursorDate, $cursorId) {
                  $q2->where('published_at', $cursorDate)
                     ->where('_id', '<', $cursorId);
              });
        });
    }

    // 4. Sorting & Execution
    $articles = $query->orderBy('published_at', 'desc')
        ->orderBy('_id', 'desc')
        ->limit(20)
        ->get();

    $last = $articles->last();

    // 5. Hydrate Category Names (similar to your discoverFeed logic)
    // This prevents the frontend from showing empty category badges
    if ($articles->isNotEmpty()) {
        $categoryIds = $articles->pluck('category_id')->unique()->toArray();
        $categories = \App\Models\Category::whereIn('id', $categoryIds)
            ->pluck('name', 'id')
            ->toArray();

        $articles->each(function ($article) use ($categories) {
            $cid = $article->category_id;
            $article->category = ['name' => $categories[$cid] ?? 'News'];
        });
    }

    Log::info("FEED CONTROLLER HIT. User: {$user->id} | Found: " . $articles->count());

    return response()->json([
        'data' => $articles,
        'nextCursor' => $last ? [
            'date' => $last->published_at->toISOString(),
            'id'   => (string) $last->_id,
        ] : null,
    ]);
}
public function discoverFeed()
{
    $user = auth()->user();

    // SQL query for subscriptions (this was crashing)
    $subscriptions = $user->subscriptions()
        ->pluck('categories.id')
        ->toArray();

    $query = Article::query();   // MongoDB

    if (!empty($subscriptions)) {
        $query->whereNotIn('category_id', $subscriptions);
    }

    // Get hottest articles (no relationship = no crash)
    $articles = $query
        ->orderBy('score', 'desc')
        ->orderBy('published_at', 'desc')
        ->limit(150)
        ->get();

    // Safe manual deduplication (one per category)
    $uniqueArticles = collect();
    $seen = [];

    foreach ($articles as $article) {
        $cid = $article->category_id ?? null;
        if ($cid && !in_array($cid, $seen)) {
            $seen[] = $cid;
            $uniqueArticles->push($article);
        }
        if ($uniqueArticles->count() >= 20) {
            break;
        }
    }

    // Load category names in ONE SQL query (avoids with('category') bugs)
    if ($uniqueArticles->isNotEmpty()) {
        $categoryIds = $uniqueArticles->pluck('category_id')->unique()->toArray();
        $categories = \App\Models\Category::whereIn('id', $categoryIds)
            ->pluck('name', 'id')
            ->toArray();

        // Attach name so frontend works
        $uniqueArticles->each(function ($article) use ($categories) {
            $cid = $article->category_id;
            $article->category = ['name' => $categories[$cid] ?? 'Topic'];
        });
    }

    return response()->json([
        'data' => $uniqueArticles,
    ]);
}

}

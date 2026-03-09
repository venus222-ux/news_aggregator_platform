<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class FeedController extends Controller
{
    // GET /api/feed?cursor=timestamp
    //feed is cached in Redis and will auto-expire after 5 minutes or be invalidated on updates.
   public function index(Request $request)
{
    $user = Auth::user();

    if (!$user) {
        return response()->json([
            'message' => 'Unauthorized'
        ], 401);
    }

    $validated = $request->validate([
        'cursor' => 'nullable|date'
    ]);

    $subscriptions = $user->subscriptions()
        ->pluck('categories.id')
        ->toArray();

    $cursor = $validated['cursor'] ?? null;

    $cacheKey = "feed:user:{$user->id}:" . ($cursor ?? 'first');

    $result = Cache::tags(['feeds', "user:{$user->id}"])
        ->remember($cacheKey, 300, function () use ($subscriptions, $cursor) {

            $query = Article::whereIn('category_id', $subscriptions)
                ->orderBy('published_at', 'desc');

            if ($cursor) {
                $query->where('published_at', '<', $cursor);
            }

            $articles = $query
                ->limit(20)
                ->get();

            return [
                'data' => $articles,
                'nextCursor' => $articles->last()?->published_at
            ];
        });

    return response()->json($result);
}
  public function discoverFeed() {
    // Example: latest 20 articles excluding user's subscriptions
    $user = auth()->user();
    $subscriptions = $user->subscriptions()->pluck('category_id');

    $articles = Article::whereNotIn('category_id', $subscriptions)
        ->orderBy('published_at','desc')
        ->limit(20)
        ->get();

    return response()->json([
        'data' => $articles,
    ]);
}

}

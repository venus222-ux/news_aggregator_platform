<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ArticleController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $categoryIds = $user->subscriptions()->pluck('categories.id');

        $articles = Article::whereIn('category_id', $categoryIds)
            ->orderBy('published_at', 'desc')
            ->limit(50)
            ->get();

        return response()->json($articles);
    }

    public function all()
    {
        $articles = Article::orderBy('published_at', 'desc')->limit(50)->get();
        return response()->json($articles);
    }

        /**
     * Admin endpoint: latest 10 articles with category name
     */
  public function latestAdmin()
{
    $articles = Article::latest()
        ->take(10)
        ->get()
        ->map(function ($article) {
            $categoryName = null;

            if ($article->category_id) {
                $category = \App\Models\Category::find($article->category_id);
                $categoryName = $category?->name;
            }

            return [
                'title' => $article->title,
                'url' => $article->url,
                'source' => $article->source,
                'published_at' => $article->published_at,
                'category' => $categoryName ?? 'Uncategorized',
            ];
        });

    return response()->json($articles);
}

public function search(Request $request)
{
    $query = $request->get('q');

    if (!$query) {
        return response()->json([]);
    }

    $articles = Article::search($query)
        ->take(20)
        ->get();

    return response()->json($articles);
}



}

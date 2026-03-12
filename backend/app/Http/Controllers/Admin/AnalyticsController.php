<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
public function articleStats()
{
    $today = Carbon::today();
    $dates = collect();
    for ($i = 29; $i >= 0; $i--) {
        $dates->push($today->copy()->subDays($i)->format('Y-m-d'));
    }

    $stats = $dates->map(function ($date) {
        // MongoDB: filtrare între începutul și sfârșitul zilei
        $start = Carbon::parse($date)->startOfDay();
        $end = Carbon::parse($date)->endOfDay();

        $views = Article::whereBetween('published_at', [$start, $end])->sum('views');
        $clicks = Article::whereBetween('published_at', [$start, $end])->sum('clicks');

        return [
            'date' => $date,
            'views' => $views,
            'clicks' => $clicks,
        ];
    });

    return response()->json($stats);
}
    public function articleStatsByCategory()
{
    $today = Carbon::today();
    $dates = collect();
    for ($i = 6; $i >= 0; $i--) {
        $dates->push($today->copy()->subDays($i)->format('Y-m-d'));
    }

    $categories = \App\Models\Category::all();

    $stats = $dates->map(function ($date) use ($categories) {
        $data = ['date' => $date];

        foreach ($categories as $category) {
            $data[$category->name] = Article::whereDate('published_at', $date)
                ->where('category_id', $category->id)
                ->sum('views'); // poți schimba în 'clicks' dacă vrei alt chart
        }

        return $data;
    });

    return response()->json($stats);
}
}

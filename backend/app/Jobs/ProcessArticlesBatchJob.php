<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Carbon\Carbon;
use App\Models\Article;
use App\Models\Category;
use App\Services\AICategoryService;

class ProcessArticlesBatchJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 5;
    // Wait 30s, then 60s, then 2mins if rate limited
    public $backoff = [30, 60, 120];

    protected array $articles;

    public function __construct(array $articles)
    {
        $this->articles = $articles;
    }

public function handle()
{
    Log::info("ProcessArticlesBatchJob started. Count: " . count($this->articles));

    if (empty($this->articles)) return;

    // Load categories once per batch
    $categories = Category::where('slug', '!=', 'uncategorized')->get();
    $uncategorized = Category::firstOrCreate(['slug' => 'uncategorized'], ['name' => 'Uncategorized']);

    $savedCount = 0;

    foreach ($this->articles as $articleData) {
        try {
            $url = $articleData['url'] ?? '';
            $title = $articleData['title'] ?? '';

            if (empty($url) || empty($title)) continue;

            // Use a consistent hash logic
            $hash = md5(strtolower(trim($title . $url)));

            $bestMatch = $this->findCategoryByKeywords($articleData, $categories);

            // Using the Article model specifically on the mongodb connection
            $article = Article::updateOrCreate(
                ['hash' => $hash],
                [
                    'title'        => Str::limit($title, 255),
                    'description'  => Str::limit($articleData['description'] ?? '', 1000),
                    'url'          => $url,
                    'source'       => $articleData['source'] ?? 'Unknown',
                    'published_at' => $this->safeParseDate($articleData['published_at'] ?? null),
                    'category_id'  => $bestMatch ? (string)$bestMatch->id : (string)$uncategorized->id,
                    'needs_ai'     => $bestMatch ? false : true,
                ]
            );

            if ($article->wasRecentlyCreated) {
                $savedCount++;
            }
        } catch (\Exception $e) {
            Log::error("Failed to save article to MongoDB: " . $e->getMessage());
        }
    }

    Log::info("Batch complete. New articles added to MongoDB: " . $savedCount);
}



private function findCategoryByKeywords($article, $categories) {
    $title = strtolower($article['title'] ?? '');
    $description = strtolower($article['description'] ?? '');
    $textToSearch = $title . ' ' . $description; // Search both for better accuracy

    $bestMatch = null;
    $maxScore = 0;

    foreach ($categories as $category) {
        $score = 0;
        // Force keywords to be an array even if MongoDB returned it weirdly
        $keywords = collect($category->keywords)->flatten()->toArray();

        foreach ($keywords as $keyword) {
            if (empty($keyword)) continue;

            // Whole word matching
            $pattern = '/\b' . preg_quote(strtolower($keyword), '/') . '\b/';

            if (preg_match($pattern, $textToSearch)) {
                $score += 3;
            }
        }

        if ($score > $maxScore) {
            $maxScore = $score;
            $bestMatch = $category;
        }
    }

    // Lower the threshold to 3 so a single keyword match works
    return ($maxScore >= 3) ? $bestMatch : null;
}

    private function safeParseDate($date): Carbon
    {
        if (empty($date)) return now();

        try {
            return Carbon::parse($date);
        } catch (\Exception) {
            return now();
        }
    }
}

// ProcessArticlesBatchJob:
// Primesc un array de articole de la FetchNewsJob.
// Creează hash pentru deduplicare.
// Inseră în MongoDB doar articolele noi.
// Flush cache-ul feed-urilor.

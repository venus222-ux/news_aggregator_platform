<?php

namespace App\Jobs;

use App\Models\Article;
use App\Models\Category;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Carbon\Carbon;
use App\Events\ArticleCreated;

class ProcessArticlesBatchJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 5;
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

        $categories = Category::where('slug', '!=', 'uncategorized')->get();
        $uncategorized = Category::firstOrCreate(['slug' => 'uncategorized'], ['name' => 'Uncategorized']);

        $savedCount = 0;

        foreach ($this->articles as $articleData) {
            try {
                $url = $articleData['url'] ?? '';
                $title = $articleData['title'] ?? '';

                if (empty($url) || empty($title)) continue;

                $hash = md5(strtolower(trim($title . $url)));

                $bestMatch = $this->findCategoryByKeywords($articleData, $categories);

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

                // 🔥 ONLY dispatch if it was a NEW article
                if ($article->wasRecentlyCreated) {
                    $savedCount++;

                    $payload = [
                        'id'          => (string) $article->id,
                        'title'       => $article->title,
                        'category_id' => (int) $article->category_id,
                    ];

                    broadcast(new ArticleCreated($payload));

                    Log::info("✅ Article broadcasted", [
                        'title' => $article->title,
                        'category_id' => $article->category_id
                    ]);
                }

            } catch (\Exception $e) {
                Log::error("Failed to save article: " . $e->getMessage());
            }
        }

        Log::info("Batch complete. New articles added to MongoDB: " . $savedCount);
    }

    private function findCategoryByKeywords($article, $categories)
    {
        $title = strtolower($article['title'] ?? '');
        $description = strtolower($article['description'] ?? '');
        $textToSearch = $title . ' ' . $description;

        $bestMatch = null;
        $maxScore = 0;

        foreach ($categories as $category) {
            $score = 0;
            $keywords = collect($category->keywords)->flatten()->toArray();

            foreach ($keywords as $keyword) {
                if (empty($keyword)) continue;
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

<?php

namespace App\Jobs;

use App\Models\Article;
use App\Models\Category;
use App\Services\AICategoryService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ClassifyArticlesAI implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 5;

    public $backoff = 300; // Wait 5 minutes before retrying the job if it fails completely

    public function handle()
    {
        // Pull articles that need AI, but skip ones that have failed 3+ times
        // MongoDB safe: handles both missing fields and fields less than 3
        $articles = Article::where('needs_ai', true)
            ->where(function ($query) {
                $query->where('ai_attempts', '<', 3)
                    ->orWhereNull('ai_attempts');
            })
            ->limit(10)
            ->get();

        if ($articles->isEmpty()) {
            Log::info('AI Classifier: No articles need processing.');

            return;
        }

        // Convert to a simple array for the Service, using _id as the key
        $batch = [];
        foreach ($articles as $article) {
            $batch[(string) $article->_id] = [
                'title' => $article->title,
            ];
        }

        try {
            $results = AICategoryService::classifyBatch($batch);
            $categories = Category::all();

            foreach ($results as $articleId => $aiSlug) {
                $cleanSlug = Str::slug($aiSlug);
                $matched = $categories->firstWhere('slug', $cleanSlug);

                if ($matched) {
                    Article::where('_id', $articleId)->update([
                        'category_id' => (string) $matched->id,
                        'needs_ai' => false,
                    ]);
                } else {
                    // If AI returns something weird, mark it as done so we don't waste money retrying it
                    Article::where('_id', $articleId)->update(['needs_ai' => false]);
                    Log::warning('AI returned unknown slug: '.$aiSlug);
                }
            }
        } catch (\Exception $e) {
            Log::error('AI Background Job Error: '.$e->getMessage());

            // 2. [POINT 3] If OpenAI rate limits the whole batch, punish the batch items
            // so they don't keep retrying infinitely every 5 minutes.
            foreach ($articles as $article) {
                $article->increment('ai_attempts');

                if (($article->ai_attempts ?? 1) >= 3) {
                    $article->update(['needs_ai' => false]);
                    Log::warning("Article ID {$article->_id} permanently skipped from AI processing after 3 failures.");
                }
            }
        }
    }
}

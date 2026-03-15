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

    // ADD THESE TWO LINES
    public $tries = 5;
    public $backoff = 300; // Wait 60 seconds before retrying if it fails

   public function handle()
{
    // Find articles that actually exist and need AI
    $articles = Article::where('needs_ai', true)->limit(10)->get();

    if ($articles->isEmpty()) {
        Log::info("AI Classifier: No articles need processing.");
        return;
    }

    // Convert to a simple array for the Service, using _id as the key
    $batch = [];
    foreach ($articles as $article) {
        $batch[(string)$article->_id] = [
            'title' => $article->title
        ];
    }

    try {
        $results = AICategoryService::classifyBatch($batch);
        $categories = Category::all();

  foreach ($results as $articleId => $aiSlug) {
    // Use Str::slug to ensure the AI's response matches your DB format
    $cleanSlug = Str::slug($aiSlug);
    $matched = $categories->firstWhere('slug', $cleanSlug);

    if ($matched) {
        Article::where('_id', $articleId)->update([
            'category_id' => (string)$matched->id,
            'needs_ai' => false
        ]);
    } else {
        // If AI returns something weird, mark it as done so we don't waste money retrying it
        Article::where('_id', $articleId)->update(['needs_ai' => false]);
        Log::warning("AI returned unknown slug: " . $aiSlug);
    }
}
    } catch (\Exception $e) {
        Log::error("AI Background Job Error: " . $e->getMessage());
    }
}
}

<?php

namespace App\Jobs;

use App\Models\Article;
use Illuminate\Bus\Queueable; // Add this
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels; // Add this

class CalculateArticleScoreJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels; // Use them here

    public function handle()
    {
        // Chunked processing for MongoDB
        Article::chunk(200, function ($articles) {
            foreach ($articles as $article) {
                $views = $article->views ?? 0;
                $clicks = $article->clicks ?? 0;
                $publishedAt = $article->published_at ? strtotime($article->published_at) : time();

                $score = log10($views + 1) +
                         log10($clicks + 1) +
                         ($publishedAt - 1134028003) / 45000;

                $article->update(['score' => $score]);
            }
        });
    }
}


// Recent articles always get a real score (no more 0).
// Old articles still have lower scores because of the recency term.
// Even if the job hasn't run yet, orderBy('published_at', 'desc') fallback guarantees you see fresh articles in Discover.
// Discovery will now show the hottest (views + clicks + newest) articles
// from categories the user is not subscribed to.

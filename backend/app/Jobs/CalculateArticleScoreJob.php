<?php

namespace App\Jobs;

use App\Models\Article;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;

class CalculateArticleScoreJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue;

    public function handle()
    {
        // Calculate for ALL articles (recency term already penalizes old ones)
        // Chunked so we don't load millions into memory
        Article::chunk(200, function ($articles) {
            foreach ($articles as $article) {
                $score =
                    log10($article->views + 1) +          // popularity
                    log10($article->clicks + 1) +         // clicks
                    (strtotime($article->published_at) - 1134028003) / 45000; // recency boost

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

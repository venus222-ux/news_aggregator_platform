<?php

namespace App\Jobs;

use App\Models\Article;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

   class CalculateArticleScoreJob implements ShouldQueue
{
    public function handle()
    {
        $articles = Article::where('published_at','>',now()->subDays(7))->get();

        foreach ($articles as $article) {

            $score =
                log10($article->views + 1) +
                (strtotime($article->published_at) - 1134028003) / 45000;

            $article->update([
                'score' => $score
            ]);
        }
    }

}

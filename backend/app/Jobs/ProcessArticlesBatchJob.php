<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use App\Models\Article;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;

class ProcessArticlesBatchJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected array $articles;

    public function __construct(array $articles)
    {
        $this->articles = $articles;
    }

    public function handle()
    {
        $insertData = [];

        foreach ($this->articles as $article) {

            $hash = md5(
                strtolower($article['title']) .
                $article['source'] .
                $article['published_at']
            );

            if (Article::where('hash', $hash)->exists()) {
                continue;
            }

            $insertData[] = [
                'title' => $article['title'],
                'description' => $article['description'],
                'content' => $article['content'],
                'url' => $article['url'],
                'source' => $article['source'],
                'published_at' => $article['published_at'],
                'hash' => $hash,
                'created_at' => now(),
                'updated_at' => now()
            ];
        }

        Article::insert($insertData);

        Cache::tags('feeds')->flush();
    }
}

<?php

namespace App\Jobs;

use App\Models\Article;
use App\Models\Category;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessArticleJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $articleData;

    public function __construct(array $articleData)
    {
        $this->articleData = $articleData;
    }

    public function handle()
    {
        $data = $this->articleData;

        // --- Assign category automatically ---
        $categoryId = null;
        if (!empty($data['category']) && is_array($data['category'])) {
            // Loop through article categories
            foreach ($data['category'] as $tag) {
                // Try to match with Category table (case-insensitive)
                $category = Category::whereRaw('LOWER(name) = ?', [strtolower($tag)])->first();
                if ($category) {
                    $categoryId = $category->id;
                    break; // stop at first match
                }
            }
        }

        // --- Create or update article ---
        Article::updateOrCreate(
            ['url' => $data['link']], // prevent duplicates
            [
                'title'        => $data['title'] ?? null,
                'description'  => $data['description'] ?? null,
                'content'      => $data['content'] ?? $data['description'] ?? null,
                'url'          => $data['link'] ?? null,
                'source'       => $data['source'] ?? null,
                'published_at' => isset($data['pubDate']) ? \Carbon\Carbon::parse($data['pubDate']) : now(),
                'category_id'  => $categoryId,
                'raw'          => $data,
            ]
        );
    }
}

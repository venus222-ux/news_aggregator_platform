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

class ProcessArticleJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $articleData;

    public function __construct(array $articleData)
    {
        $this->articleData = $articleData;
    }

    public function handle()
    {
        try {
            $normalized = $this->normalizeData($this->articleData);

            // Prevent duplicates by URL or hash (fallback)
         $hash = md5(
           strtolower($normalized['title']) .
           $normalized['source'] .
           $normalized['published_at']
           );

           if (
             Article::where('url', $normalized['url'])->exists() ||
             Article::where('hash', $hash)->exists()
           ) {
            return;
           }

            $categoryId = $this->detectCategory($normalized);

            Article::create([
                'title' => $normalized['title'],
                'description' => $normalized['description'],
                'content' => $normalized['content'],
                'url' => $normalized['url'],
                'source' => $normalized['source'],
                'published_at' => \Carbon\Carbon::parse($normalized['published_at']),
                'category_id' => $categoryId,
                'raw' => $normalized['raw'],
                'hash' => $hash, // New field for duplicate detection
            ]);

            // Invalidate user caches (simple: invalidate all feed caches; optimize later)
            Cache::tags('feeds')->flush();
        } catch (\Exception $e) {
            Log::error("Article processing failed: {$e->getMessage()}");
            $this->fail($e);
        }
    }
private function normalizeData(array $data): array
{
    $published = $data['published_at']
        ?? $data['pubDate']
        ?? $data['created_at']
        ?? now();

    try {
        $published = \Carbon\Carbon::parse($published);
    } catch (\Exception $e) {
        $published = now();
    }

    return [
        'title' => trim($data['title'] ?? ''),
        'description' => trim(
            Str::limit($data['description']
            ?? $data['summary']
            ?? $data['content']
            ?? '', 255)
        ),
        'content' => trim(
            $data['content']
            ?? $data['description']
            ?? $data['summary']
            ?? ''
        ),
        'url' => $data['url'] ?? $data['link'] ?? null,
        'source' => $data['source'] ?? 'Unknown',
        'published_at' => $published,
        'category' => $data['category'] ?? [],
        'raw' => $data['raw'] ?? $data,
    ];
}
   private function detectCategory(array $data): ?string
{
    $text = strtolower($data['title'] . ' ' . $data['description']);

    $categories = Category::all();

    foreach ($categories as $category) {

        // keywords column from database
        $keywords = $category->keywords ?? [];

        // if stored as JSON string convert to array
        if (is_string($keywords)) {
            $keywords = json_decode($keywords, true);
        }

        foreach ($keywords as $keyword) {

            if (str_contains($text, strtolower($keyword))) {
                return $category->id;
            }
        }
    }

    return null;
}
}

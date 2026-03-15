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

class ProcessArticleJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $timeout = 60;

    protected array $articleData;

    public function __construct(array $articleData)
    {
        $this->articleData = $articleData;
    }

    public function handle(): void
    {
        try {

            $normalized = $this->normalizeData($this->articleData);

            // 🚨 Skip if no URL
            if (empty($normalized['url'])) {
                return;
            }

            $hash = md5(
                strtolower($normalized['title']) .
                strtolower($normalized['source']) .
                $normalized['url']
            );

            // 🚨 Prevent duplicates
            if (
                Article::where('url', $normalized['url'])->exists() ||
                Article::where('hash', $hash)->exists()
            ) {
                return;
            }

            $categoryId = $this->detectCategory($normalized);

            $article = Article::create([
                'title'        => $normalized['title'],
                'description'  => $normalized['description'],
                'content'      => $normalized['content'],
                'url'          => $normalized['url'],
                'source'       => $normalized['source'],
                'published_at' => Carbon::parse($normalized['published_at']),
                'category_id'  => $categoryId,
                'raw'          => $normalized['raw'],
                'hash'         => $hash,
            ]);

            // 🔥 Broadcast safely after DB commit
            event(new \App\Events\ArticleCreated($article));

            // Clear feed cache
            Cache::tags(['feeds'])->flush();

        } catch (\Throwable $e) {
            Log::error("Article processing failed: " . $e->getMessage());
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
            $published = Carbon::parse($published);
        } catch (\Exception) {
            $published = now();
        }

        return [
            'title' => trim($data['title'] ?? ''),
            'description' => Str::limit(
                trim($data['description']
                ?? $data['summary']
                ?? $data['content']
                ?? ''),
                255
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
            'raw' => $data['raw'] ?? $data,
        ];
    }

    private function detectCategory(array $data): ?int
    {
        $text = strtolower($data['title'] . ' ' . $data['description']);

        $categories = Cache::remember('categories_keywords', 3600, function () {
            return Category::all();
        });

        foreach ($categories as $category) {

            $keywords = $category->keywords ?? [];

            if (is_string($keywords)) {
                $keywords = json_decode($keywords, true) ?? [];
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


//Diferența dintre cele două joburi FetchNewsJob si ProcessArticleJob
//este una de responsabilitate (Single Responsibility Principle).
//În esență, primul se ocupă de „aprovizionare”, iar al doilea de „depozitare și organizare”.

//Indiferent de unde vin știrile, la final toate devin un array
//cu aceleași chei: title, description, content, url, published_at, category, source, raw.1

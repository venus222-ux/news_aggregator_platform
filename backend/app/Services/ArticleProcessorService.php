<?php

namespace App\Services;

use App\Models\Article;
use App\Models\Category;

class ArticleProcessorService
{

   //This normalizes different APIs into one structure.
    public function process(array $data)
    {
        $url = $data['url'] ?? null;

        if (!$url) {
            return;
        }

        // Prevent duplicates
        if (Article::where('url', $url)->exists()) {
            return;
        }

        $categoryId = $this->detectCategory($data);

        Article::create([
            'title' => $data['title'] ?? '',
            'description' => $data['description'] ?? null,
            'content' => $data['content'] ?? null,
            'url' => $url,
            'source' => $data['source'] ?? 'unknown',
            'published_at' => $data['published_at'] ?? now(),
            'category_id' => $categoryId,
            'raw' => $data['raw'] ?? $data,
        ]);
    }

    private function detectCategory($data)
    {
        $text = strtolower(($data['title'] ?? '') . ' ' . ($data['description'] ?? ''));

        $categories = Category::all();

        foreach ($categories as $category) {
            if (str_contains($text, strtolower($category->name))) {
                return $category->id;
            }
        }

        return null;
    }
}

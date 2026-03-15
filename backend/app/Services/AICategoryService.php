<?php

namespace App\Services;

use OpenAI\Laravel\Facades\OpenAI;
use App\Models\Category;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;

class AICategoryService
{
    public static function classifyBatch(iterable $articles)
    {
        if ($articles instanceof \Illuminate\Support\Collection) {
            $articles = $articles->toArray();
        }

        if (empty($articles)) return [];

        // We chunk by 15. Since we only get 3 requests per minute,
        // we want each request to process as much as possible.
        $chunks = array_chunk($articles, 15, true);
        $finalResults = [];

        $categories = Category::where('slug', '!=', 'uncategorized')->get();
        $slugList = $categories->pluck('slug')->implode(', ');

        foreach ($chunks as $chunk) {

            // --- STRICT RATE LIMITING LOGIC ---
            // Ensure at least 21 seconds have passed since the LAST successful request
            $lastRequest = Cache::get('openai_last_request_at', 0);
            $secondsSinceLast = microtime(true) - $lastRequest;

            if ($secondsSinceLast < 21) {
                $waitTime = ceil(21 - $secondsSinceLast);
                Log::info("Throttling OpenAI: Sleeping {$waitTime}s to stay under 3 req/min...");
                sleep($waitTime);
            }

            $promptContent = "";
            foreach ($chunk as $index => $article) {
                $title = is_array($article) ? ($article['title'] ?? 'No Title') : ($article->title ?? 'No Title');
                $promptContent .= "ID: {$index} | Title: {$title}\n";
            }

            try {
                $response = OpenAI::chat()->create([
                    'model' => 'gpt-4o-mini',
                    'temperature' => 0,
                    'response_format' => ['type' => 'json_object'],
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => "Classify news. Assign one slug from: [{$slugList}]. Return JSON: {\"ID\": \"slug\"}"
                        ],
                        ['role' => 'user', 'content' => $promptContent]
                    ]
                ]);

                // Update the timer after a successful request
                Cache::put('openai_last_request_at', microtime(true), 60);

                $chunkResults = json_decode($response->choices[0]->message->content, true);
                $finalResults = $finalResults + (array)$chunkResults;

            } catch (\Exception $e) {
                if (str_contains($e->getMessage(), '429') || str_contains($e->getMessage(), 'rate limit')) {
                    // Mark that we hit the limit so other workers know to stop
                    Cache::put('openai_last_request_at', microtime(true) + 60, 120);
                    throw new \Exception("RATE_LIMIT");
                }
                Log::error("AI Chunk Error: " . $e->getMessage());
            }
        }

        return $finalResults;
    }

    public static function bulkClassify(iterable $articles)
    {
        return self::classifyBatch($articles);
    }
}

<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use OpenAI\Laravel\Facades\OpenAI;

class AICategoryService
{
    public static function classifyBatch(iterable $articles)
    {
        if ($articles instanceof Collection) {
            $articles = $articles->toArray();
        }

        if (empty($articles)) {
            return [];
        }

        // We chunk by 15. Since we only get 3 requests per minute,
        // we want each request to process as much as possible.
        $chunks = array_chunk($articles, 15, true);
        $finalResults = [];

        $categories = Category::where('slug', '!=', 'uncategorized')->get();
        $slugList = $categories->pluck('slug')->implode(', ');

        foreach ($chunks as $chunk) {

            // --- STRICT RATE LIMITING LOGIC ---
            $lastRequest = Cache::get('openai_last_request_at', 0);
            $secondsSinceLast = microtime(true) - $lastRequest;

            if ($secondsSinceLast < 21) {
                $waitTime = ceil(21 - $secondsSinceLast);
                Log::info("Throttling OpenAI: Sleeping {$waitTime}s to stay under 3 req/min...");
                sleep($waitTime);
            }

            $promptContent = '';
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
                            'content' => "Classify news. Assign one slug from: [{$slugList}]. Return JSON: {\"ID\": \"slug\"}",
                        ],
                        ['role' => 'user', 'content' => $promptContent],
                    ],
                ]);

                // Update the timer after a successful request
                Cache::put('openai_last_request_at', microtime(true), 60);

                $chunkResults = json_decode($response->choices[0]->message->content, true);
                $finalResults = $finalResults + (array) $chunkResults;

            } catch (\Exception $e) {
                $rawMessage = $e->getMessage();

                // 🔥 CRITICAL: Log the actual unmasked error message to daily logs
                Log::error('OpenAI API RAW ERROR: '.$rawMessage);

                if (str_contains($rawMessage, 'quota') || str_contains($rawMessage, 'billing')) {
                    throw new \Exception('CREDITS_EXPIRED: Check your OpenAI Billing Dashboard.');
                }

                if (str_contains($rawMessage, '429') || str_contains($rawMessage, 'rate limit')) {
                    // Mark that we hit the limit so other workers know to stop
                    Cache::put('openai_last_request_at', microtime(true) + 60, 120);
                    throw new \Exception('RATE_LIMIT');
                }

                Log::error('AI Chunk Error: '.$rawMessage);
            }
        }

        return $finalResults;
    }

    public static function bulkClassify(iterable $articles)
    {
        return self::classifyBatch($articles);
    }
}

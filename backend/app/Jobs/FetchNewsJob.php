<?php

namespace App\Jobs;

use App\Jobs\ProcessArticleJob;
use App\Models\Source;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use SimpleXMLElement;
use Illuminate\Support\Facades\Log;

class FetchNewsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle()
    {
        $sources = Source::all();

        foreach ($sources as $source) {
            $articles = [];

            if ($source->type === 'rss') {
                // --- RSS Feed ---
                try {
                    $xmlContent = file_get_contents($source->url);
                    if ($xmlContent) {
                        $rss = new SimpleXMLElement($xmlContent);
                        foreach ($rss->channel->item as $item) {
                            $articles[] = [
                                'title'       => (string) $item->title,
                                'link'        => (string) $item->link,
                                'description' => (string) $item->description,
                                'pubDate'     => (string) $item->pubDate,
                                'category'    => array_map('strval', iterator_to_array($item->category)),
                                'source'      => $source->name,
                                'content'     => (string) $item->children('content', true)->encoded ?? (string) $item->description,
                            ];
                        }
                    }
                } catch (\Exception $e) {
                    Log::error("RSS fetch failed for {$source->name}: {$e->getMessage()}");
                }
            } elseif ($source->type === 'api') {
                // --- JSON API ---
                try {
                    $response = Http::get($source->url, $source->api_key ? ['api_key' => $source->api_key] : []);
                    if ($response->ok()) {
                        $json = $response->json();

                        // Example: Reddit JSON structure
                        if (isset($json['data']['children'])) {
                            foreach ($json['data']['children'] as $item) {
                                $data = $item['data'];
                                $articles[] = [
                                    'title'       => $data['title'] ?? null,
                                    'link'        => 'https://reddit.com' . ($data['permalink'] ?? ''),
                                    'description' => $data['selftext'] ?? null,
                                    'pubDate'     => isset($data['created_utc']) ? date('r', $data['created_utc']) : null,
                                    'category'    => [$data['subreddit'] ?? 'Reddit'],
                                    'source'      => $source->name,
                                    'content'     => $data['selftext'] ?? null,
                                ];
                            }
                        }
                    }
                } catch (\Exception $e) {
                    Log::error("API fetch failed for {$source->name}: {$e->getMessage()}");
                }
            }

            // --- Dispatch processing jobs ---
            foreach ($articles as $article) {
                ProcessArticleJob::dispatch($article);
            }
        }
    }
}

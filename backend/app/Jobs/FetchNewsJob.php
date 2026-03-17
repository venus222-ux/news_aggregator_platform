<?php

namespace App\Jobs;

use App\Models\Source;
use App\Jobs\ProcessArticlesBatchJob; // <--- THIS WAS MISSING
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use SimpleXMLElement;

class FetchNewsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $timeout = 120;

    public function handle()
    {
        $sources = Source::all();

        Log::info("FetchNewsJob starting: Found " . $sources->count() . " sources.");

        foreach ($sources as $source) {
            $articles = $this->fetchArticlesFromSource($source);

            if (!empty($articles)) {
                // Dispatch the articles to be processed in the background
                ProcessArticlesBatchJob::dispatch($articles);
                Log::info("SUCCESS: Dispatched " . count($articles) . " articles from {$source->name}");
            } else {
                Log::warning("EMPTY: No articles found for {$source->name}");
            }
        }
    }

    private function fetchArticlesFromSource(Source $source): array
    {
        $articles = [];

        try {
            if ($source->type === 'rss') {
                $response = Http::withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) NewsAggregator/1.0',
                    'Accept' => 'application/xml,text/xml,*/*'
                ])->timeout(20)->get($source->url);

                if (!$response->successful()) {
                    Log::error("HTTP Error for {$source->name}: " . $response->status());
                    return [];
                }

                $rss = new \SimpleXMLElement($response->body());

                $items = $rss->channel->item ?? [];

                 foreach ($items as $item) {
                    $articles[] = [
                        'title' => (string) $item->title,
                        'description' => (string) $item->description,
                        'content' => (string) ($item->children('content', true)->encoded ?? $item->description),
                        'url' => (string) $item->link,
                        'published_at' => (string) $item->pubDate,
                        'category' => array_map('strval', iterator_to_array($item->category ?? [])),
                        'source' => $source->name,
                        'raw' => json_decode(json_encode($item), true),
                    ];
                }
            } elseif ($source->type === 'api') {
                $params = $source->api_key ? ['apiKey' => $source->api_key] : [];
                $response = Http::timeout(30)->get($source->url, $params);

                if ($response->ok()) {
                    $json = $response->json();

                    // NewsAPI logic
                    if (isset($json['articles'])) {
                       $articlesApi = $json['articles'] ?? [];
                       foreach ($articlesApi as $item) {
                            $articles[] = [
                                'title' => $item['title'] ?? null,
                                'description' => $item['description'] ?? null,
                                'content' => $item['content'] ?? null,
                                'url' => $item['url'] ?? null,
                                'published_at' => $item['publishedAt'] ?? null,
                                'category' => [$item['category'] ?? 'General'],
                                'source' => $item['source']['name'] ?? $source->name,
                                'raw' => $item,
                            ];
                        }
                    }

                    // Reddit logic
                    if (isset($json['data']['children'])) {
                        foreach ($json['data']['children'] as $child) {
                            $data = $child['data'];
                            $articles[] = [
                                'title' => $data['title'] ?? null,
                                'description' => $data['selftext'] ?? null,
                                'content' => $data['selftext'] ?? null,
                                'url' => 'https://reddit.com' . ($data['permalink'] ?? ''),
                                'published_at' => date('r', $data['created_utc'] ?? time()),
                                'category' => [$data['subreddit'] ?? 'Reddit'],
                                'source' => $source->name,
                                'raw' => $data,
                            ];
                        }
                    }
                }
            }
        } catch (\Exception $e) {
            Log::error("Fetch failed for source {$source->name}: {$e->getMessage()}");
        }

        return $articles;
    }
}
// FetchNewsJob:
// Rulează periodic (scheduler) și ia toate sursele din sources.
// Pentru fiecare sursă:
// Dacă e rss, parsează XML.
// Dacă e api, face HTTP request și normalizează articolele.
// Apelează ProcessArticlesBatchJob pentru procesarea articolelor în batch.


//Diferența dintre cele două joburi FetchNewsJob si ProcessArticleJob
//este una de responsabilitate (Single Responsibility Principle).
//În esență, primul se ocupă de „aprovizionare”, iar al doilea de „depozitare și organizare”.

//Indiferent de unde vin știrile, la final toate devin un array
//cu aceleași chei: title, description, content, url, published_at, category, source, raw.

// Rezumat vizual
// FetchNewsJob pornește.
// Merge la Sursa A (RSS) -> scoate  10 articole -> Trimite batch la procesat.
// Merge la Sursa B (API) -> Scoate 20 articole -> Trimite batch la procesat.
// Se închide, lăsând ProcessArticlesBatchJob să facă munca grea de scriere în MongoDB.

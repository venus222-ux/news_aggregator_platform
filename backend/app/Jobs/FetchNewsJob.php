<?php

namespace App\Jobs;

use App\Models\Source;
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

    public $tries = 3; // Retry failed fetches
    public $timeout = 120; // Prevent long hangs


    public function handle()
    {
        $sources = Source::all(); //extrage din baza de date toate site-urile de unde trebuie luate știri.

foreach ($sources as $source) {
    $articles = $this->fetchArticlesFromSource($source);

    if (!empty($articles)) {
        ProcessArticlesBatchJob::dispatch($articles);

    }
}
    }

    private function fetchArticlesFromSource(Source $source): array
    {
        $articles = [];

        try {
            if ($source->type === 'rss') {
                $xmlContent = file_get_contents($source->url);
                if (!$xmlContent) return [];

                $rss = new SimpleXMLElement($xmlContent);
                foreach ($rss->channel->item as $item) {
                    $articles[] = [
                        'title' => (string) $item->title,
                        'description' => (string) $item->description,
                        'content' => (string) $item->children('content', true)->encoded ?? (string) $item->description,
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

                if (!$response->ok()) {
                    throw new \Exception('API request failed: ' . $response->status());
                }

                $json = $response->json();

                // Handle NewsAPI structure
                if (isset($json['articles'])) {
                    foreach ($json['articles'] as $item) {
                        $articles[] = [
                            'title' => $item['title'] ?? null,
                            'description' => $item['description'] ?? null,
                            'content' => $item['content'] ?? null,
                            'url' => $item['url'] ?? null,
                            'published_at' => $item['publishedAt'] ?? null,
                            'category' => [$item['category'] ?? 'General'], // Adjust per API
                            'source' => $item['source']['name'] ?? $source->name,
                            'raw' => $item,
                        ];
                    }
                }

                // Handle Reddit structure
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

<?php

namespace App\Services;

use App\Models\Source;
use Illuminate\Support\Facades\Http;
use SimpleXMLElement;
use App\Jobs\ProcessArticleJob;


//Fetching news from sources
class NewsFetchService
{
    //Loads all sources from the sources table (MySQL) and decides how to fetch each one.
    public function fetchAll()
    {
        $sources = Source::all();

        foreach ($sources as $source) {

            if ($source->type === 'api') {
                $this->fetchFromApi($source);
            }

            if ($source->type === 'rss') {
                $this->fetchFromRss($source);
            }
        }
    }

    //fetchFromApi() → Fetches articles from APIs:
    private function fetchFromApi(Source $source)
    {
        $response = Http::get($source->url, [
            'apiKey' => $source->api_key
        ]);

        if (!$response->ok()) return;

        foreach ($response->json()['articles'] ?? [] as $item) {

            ProcessArticleJob::dispatch([
                'title' => $item['title'] ?? '',
                'description' => $item['description'] ?? null,
                'content' => $item['content'] ?? null,
                'url' => $item['url'] ?? null,
                'published_at' => $item['publishedAt'] ?? now(),
                'source' => $source->name,
                'raw' => $item
            ]);

        }
    }

    //fetchFromRss() → Fetches articles from RSS feeds:
    private function fetchFromRss(Source $source)
    {
        $xml = simplexml_load_file($source->url, SimpleXMLElement::class, LIBXML_NOCDATA);

        if (!$xml || !isset($xml->channel->item)) return;

        foreach ($xml->channel->item as $item) {

            ProcessArticleJob::dispatch([
                'title' => (string)$item->title,
                'description' => (string)$item->description,
                'content' => (string)$item->description,
                'url' => (string)$item->link,
                'published_at' => (string)$item->pubDate,
                'source' => $source->name,
                'raw' => json_decode(json_encode($item), true)
            ]);

        }
    }
}

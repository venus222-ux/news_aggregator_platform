SOURCES:
{
"name":"TechCrunch RSS",
"type":"rss",
"url":"https://techcrunch.com/feed"
}

{
"name": "BBC News - World",
"type": "rss",
"url": "https://feeds.bbci.co.uk/news/world/rss.xml"
}

\App\Models\Source::create([
'name' => 'The Verge',
'type' => 'rss',
'url' => 'https://www.theverge.com/rss/index.xml'
]);

\App\Models\Source::create([
'name' => 'WIRED',
'type' => 'rss',
'url' => 'https://www.wired.com/feed/rss'
]);

\App\Models\Source::create([
'name' => 'NYT World',
'type' => 'rss',
'url' => 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml'
]);

\App\Models\Source::create([
'name' => 'Reuters World',
'type' => 'rss',
'url' => 'https://feeds.reuters.com/Reuters/worldNews',
]);

\App\Models\Source::create([
'name' => 'Al Jazeera English',
'type' => 'rss',
'url' => 'https://www.aljazeera.com/xml/rss/all.xml',
]);

\App\Models\Source::create([
'name' => 'Associated Press',
'type' => 'rss',
'url' => 'https://apnews.com/rss',
]);

\App\Models\Source::create([
'name' => 'Ars Technica',
'type' => 'rss',
'url' => 'https://feeds.arstechnica.com/arstechnica/index',
]);

\App\Models\Source::create([
'name' => 'Mashable Tech',
'type' => 'rss',
'url' => 'https://mashable.com/feeds/rss/tech',
]);

\App\Models\Source::create([
'name' => 'Hacker News',
'type' => 'rss',
'url' => 'https://news.ycombinator.com/rss',
]);

\App\Models\Source::create([
'name' => 'Bloomberg',
'type' => 'rss',
'url' => 'https://feeds.bloomberg.com/markets/news.rss',
]);

\App\Models\Source::create([
'name' => 'Financial Times',
'type' => 'rss',
'url' => 'https://www.ft.com/rss/home',
]);
\App\Models\Source::create([
'name' => 'NASA Breaking News',
'type' => 'rss',
'url' => 'https://www.nasa.gov/rss/dyn/breaking_news.rss',
]);

\App\Models\Source::create([
'name' => 'Scientific American',
'type' => 'rss',
'url' => 'https://www.scientificamerican.com/feed/',
]);

\App\Models\Source::create([
'name' => 'Reddit - Technology',
'type' => 'rss',
'url' => 'https://www.reddit.com/r/technology/.rss',
]);

\App\Models\Source::create([
'name' => 'Reddit - WorldNews',
'type' => 'rss',
'url' => 'https://www.reddit.com/r/worldnews/.rss',
]);

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Politics',
                'keywords' => [
                    'politics', 'government', 'election', 'senate', 'democrat', 'republican',
                    'parliament', 'minister', 'president', 'policy', 'trump', 'biden', 'white house'
                ]
            ],
            [
                'name' => 'Tech',
                'keywords' => [
                    'technology', 'software', 'startup', 'gadget', 'internet', 'platform',
                    'cybersecurity', 'apple', 'google', 'microsoft', 'silicon valley'
                ]
            ],
            [
                'name' => 'Sports',
                'keywords' => [
                    'sports', 'football', 'soccer', 'nba', 'tennis', 'cricket', 'match',
                    'league', 'fifa', 'nfl', 'olympics', 'f1', 'grand prix', 'athlete', 'stadium'
                ]
            ],
            [
                'name' => 'AI',
                'keywords' => [
                    'artificial intelligence', 'machine learning', 'llm', 'chatgpt',
                    'neural', 'deep learning', 'openai', 'anthropic', 'generative ai'
                ]
            ],
            [
                'name' => 'Business',
                'keywords' => [
                    'business', 'company', 'market', 'economy', 'corporate', 'trade',
                    'startup', 'merger', 'acquisition', 'ceo', 'industry'
                ]
            ],
            [
                'name' => 'World',
                'keywords' => [
                    'international', 'global', 'foreign', 'war', 'conflict', 'israel',
                    'iran', 'lebanon', 'russia', 'ukraine', 'gaza', 'hamas', 'syria',
                    'china', 'united nations', 'border', 'strike', 'military'
                ]
            ],
            [
                'name' => 'Health',
                'keywords' => [
                    'health', 'medical', 'hospital', 'disease', 'virus', 'covid',
                    'vaccine', 'doctor', 'surgery', 'mental health', 'fda', 'wellness'
                ]
            ],
            [
                'name' => 'Entertainment',
                'keywords' => [
                    'entertainment', 'movie', 'film', 'celebrity', 'music', 'tv',
                    'hollywood', 'oscars', 'netflix', 'streaming', 'concert', 'actor'
                ]
            ],
            [
                'name' => 'Science',
                'keywords' => [
                    'science', 'research', 'space', 'nasa', 'discovery', 'experiment',
                    'physics', 'biology', 'astronomy', 'quantum', 'dna'
                ]
            ],
            [
                'name' => 'Education',
                'keywords' => [
                    'education', 'school', 'university', 'college', 'students',
                    'learning', 'teacher', 'degree', 'campus', 'scholarship'
                ]
            ],
            [
                'name' => 'Environment',
                'keywords' => [
                    'environment', 'climate', 'global warming', 'pollution',
                    'sustainability', 'renewable', 'carbon', 'emissions', 'nature'
                ]
            ],
            [
                'name' => 'Travel',
                'keywords' => [
                    'travel', 'tourism', 'flight', 'airport', 'visa', 'destination',
                    'hotel', 'vacation', 'resort', 'cruise'
                ]
            ],
            [
                'name' => 'Finance',
                'keywords' => [
                    'finance', 'stock', 'investment', 'bank', 'crypto', 'bitcoin',
                    'inflation', 'interest rates', 'wall street', 'revenue'
                ]
            ],
            [
                'name' => 'Lifestyle',
                'keywords' => [
                    'lifestyle', 'fashion', 'culture', 'life', 'trend', 'cooking',
                    'design', 'family', 'dating', 'home'
                ]
            ],
            [
                'name' => 'Uncategorized',
                'keywords' => []
            ],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['slug' => Str::slug($category['name'])],
                [
                    'name' => $category['name'],
                    'keywords' => $category['keywords'],
                ]
            );
        }
    }
}

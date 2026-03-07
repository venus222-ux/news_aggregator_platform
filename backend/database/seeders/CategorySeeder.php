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
            'Politics',
            'Tech',
            'Sports',
            'AI',
            'Business',
            'World',
            'Health',
            'Entertainment',
            'Science',
            'Education',
            'Environment',
            'Travel',
            'Opinion',
            'Lifestyle',
            'Finance',
        ];

        foreach ($categories as $name) {
            Category::updateOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name]
            );
        }
    }
}

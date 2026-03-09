<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Source extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',       // e.g., "NewsAPI" or "TechCrunch RSS"
        'type',       // 'api' | 'rss'
        'url',        // API endpoint or RSS feed URL
        'api_key',    // optional for APIs
    ];
}

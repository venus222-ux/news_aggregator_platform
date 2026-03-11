<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use Laravel\Scout\Searchable;

class Article extends Model
{
    use Searchable;

    protected $connection = 'mongodb';
    protected $collection = 'articles';

    protected $fillable = [
        'title',
        'description',
        'content',
        'url',
        'source',
        'published_at',
        'category_id',
        'raw',
        'hash'
    ];

    protected $casts = [
        'published_at' => 'datetime',
    ];

    public function searchableAs()
    {
        return 'articles_index';
    }

    public function toSearchableArray()
    {
        return [
            'title' => $this->title,
            'description' => $this->description,
            'content' => $this->content,
            'source' => $this->source,
            'published_at' => $this->published_at,
        ];
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}

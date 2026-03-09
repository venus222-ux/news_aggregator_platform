<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Article extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'articles';

    protected $fillable = [
        'title', 'description', 'content', 'url', 'source', 'published_at', 'category_id', 'raw', 'hash',
    ];

    protected $casts = [
        'published_at' => 'datetime',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }
}

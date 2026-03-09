<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Article extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'articles';

    protected $fillable = [
        'title',
        'description',
        'content',
        'url',
        'source',
        'published_at',
        'category_id', // stores the ObjectId of the category
        'raw',
    ];

    protected $casts = [
        'published_at' => 'datetime',
    ];

    /**
     * Category relationship
     */
    public function category()
    {
        // Ensure correct relation with MongoDB ObjectId
        return $this->belongsTo(Category::class, 'category_id', '_id');
    }
}

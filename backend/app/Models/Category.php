<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug','embedding'];

    public function subscribers()
    {
        return $this->belongsToMany(User::class)->withTimestamps();
    }

    protected $casts = [
       'keywords' => 'array',
    ];
}

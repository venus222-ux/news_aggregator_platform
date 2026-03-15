<?php

namespace App\Events;

use App\Models\Article;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class ArticleCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public bool $afterCommit = true; // 🔥 Important

    public Article $article;

    public function __construct(Article $article)
    {
        $this->article = $article;
    }

    public function broadcastOn(): PrivateChannel
{
    return new PrivateChannel(
        'category.' . ($this->article->category_id ?? 'general')
    );
}



    public function broadcastAs(): string
    {
        return 'article.created';
    }
}

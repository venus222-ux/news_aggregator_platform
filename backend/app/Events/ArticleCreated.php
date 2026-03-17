<?php

namespace App\Events;

use Illuminate\Broadcasting\PrivateChannel;
// Use ShouldBroadcastNow instead of ShouldBroadcast
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\InteractsWithSockets;

class ArticleCreated implements ShouldBroadcastNow // <--- CHANGE THIS
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $article;

    public function __construct(array $article)
    {
        $this->article = $article;
    }

    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel(
            'category.' . ($this->article['category_id'] ?? 'general')
        );
    }

    public function broadcastWith(): array
    {
        return [
            'article' => $this->article
        ];
    }

    public function broadcastAs(): string
    {
        return 'article.created';
    }
}

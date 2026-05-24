<?php

namespace App\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class ArticleCreated implements ShouldBroadcast
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

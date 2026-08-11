<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ArticleCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $article;

    public function __construct(array $article)
    {
        $this->article = $article;
    }

    public function broadcastOn(): array
    {
        $categoryId = $this->article['category_id'] ?? 'general';

        return [
            new PrivateChannel("category.{$categoryId}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'article.created';   // Matches your frontend listener: ".article.created"
    }

    public function broadcastWith(): array
    {
        return [
            'article' => $this->article,
        ];
    }
}

<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('category.{id}', function ($user, $id) {
    logger()->info('BROADCAST CHECK', [
        'user_id' => $user?->id,
        'category_id' => $id,
    ]);

    // Allow all authenticated users for now (you can restrict later)
    return $user !== null;
});

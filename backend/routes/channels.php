<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// routes/channels.php

// routes/channels.php
Broadcast::channel('category.{id}', function ($user, $id) {
    return $user !== null; // Or: return $user->subscriptions()->where('category_id', $id)->exists();
});

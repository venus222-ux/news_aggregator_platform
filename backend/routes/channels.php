<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// routes/channels.php

// routes/channels.php
Broadcast::channel('category.{categoryId}', function ($user, $categoryId) {
    // Check if the JWT middleware successfully identified the user
    return $user !== null;
});

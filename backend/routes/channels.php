<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('category.{categoryId}', function ($user, $categoryId) {
    // Only allow user if they are subscribed to this category
    return $user->subscriptions()->pluck('id')->contains((int)$categoryId);
});

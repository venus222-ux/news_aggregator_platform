<?php

namespace App\Observers;

use App\Models\User;
use Illuminate\Support\Facades\Cache;

class UserObserver
{
    public function updated(User $user)
    {
        if ($user->isDirty('subscriptions')) { // Pseudo-check; implement as needed
            Cache::tags(["user:{$user->id}"])->flush();
        }
    }
}

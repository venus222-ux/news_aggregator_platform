<?php

namespace App\Providers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Broadcast;

class BroadcastServiceProvider extends ServiceProvider
{
public function boot(): void
{
    Auth::shouldUse('api');

    Broadcast::routes(['middleware' => ['api']]);

    require base_path('routes/channels.php');

}
}

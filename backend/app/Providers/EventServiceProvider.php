<?php

namespace App\Providers;

use App\Events\Auth\PasswordResetRequested;
// Events
use App\Events\Auth\UserLoggedIn;
use App\Events\Auth\UserRegistered;
use App\Listeners\LogUserLogin;
// Listeners
use App\Listeners\SendResetPasswordNotification;
use App\Listeners\SendWelcomeEmail;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        UserRegistered::class => [
            SendWelcomeEmail::class,
        ],

        UserLoggedIn::class => [
            LogUserLogin::class,
        ],

        PasswordResetRequested::class => [
            SendResetPasswordNotification::class,
        ],
    ];

    /**
     * Register any events for your application.
     */
    public function boot(): void
    {
        parent::boot();
    }
}

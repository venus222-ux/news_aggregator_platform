<?php

namespace App\Listeners;

use App\Events\Auth\PasswordResetRequested;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendResetPasswordNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(PasswordResetRequested $event): void
    {
        $event->user->notify(
            new ResetPasswordNotification($event->token)
        );
    }
}

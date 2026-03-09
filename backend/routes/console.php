<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

use App\Jobs\FetchNewsJob;
use Illuminate\Support\Facades\Schedule;


Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

//Laravel will check the schedule every minute and run the job every 15 minutes.
Schedule::job(new FetchNewsJob())
    ->everyFifteenMinutes();

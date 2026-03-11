<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Jobs\FetchNewsJob;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Run FetchNewsJob every 10 minutes
Schedule::call(function () {
    FetchNewsJob::dispatch()->onQueue('default');
})
->name('fetch-news-job')
->everyTenMinutes()
->withoutOverlapping();

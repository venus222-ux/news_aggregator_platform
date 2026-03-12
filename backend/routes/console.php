<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

// Add this import
use App\Jobs\CalculateArticleScoreJob;
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

// ✅ CORRECTED: CalculateArticleScoreJob
Schedule::job(new CalculateArticleScoreJob())
    ->everyFiveMinutes()
    ->withoutOverlapping();   // prevents overlapping runs

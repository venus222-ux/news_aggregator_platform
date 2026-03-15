<?php

use App\Jobs\CalculateArticleScoreJob;
use App\Jobs\ClassifyArticlesAI;
use App\Jobs\FetchNewsJob;
use Illuminate\Support\Facades\Schedule;

// Use Class Name string instead of "new Job()"
Schedule::job(FetchNewsJob::class)
    ->everyMinute();

Schedule::job(CalculateArticleScoreJob::class)
    ->everyTenMinutes()
    ->withoutOverlapping();

Schedule::job(ClassifyArticlesAI::class)
    ->everyFiveMinutes();

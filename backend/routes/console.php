<?php

use App\Jobs\CalculateArticleScoreJob;
use App\Jobs\ClassifyArticlesAI;
use App\Jobs\FetchNewsJob;
use Illuminate\Support\Facades\Schedule;

// Use Class Name string instead of "new Job()"
// Test
Schedule::job(FetchNewsJob::class)
    ->everyFiveMinutes()->withoutOverlapping();
 
// Production
// Schedule::job(FetchNewsJob::class)
//     ->everyTenMinutes()
//     ->withoutOverlapping();

Schedule::job(CalculateArticleScoreJob::class)
    ->everyTenMinutes()
    ->withoutOverlapping();

Schedule::job(ClassifyArticlesAI::class)
    ->everyFiveMinutes();
 
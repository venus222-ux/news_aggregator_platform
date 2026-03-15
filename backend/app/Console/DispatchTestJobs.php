<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Jobs\TestJob;

class DispatchTestJobs extends Command
{
    protected $signature = 'test:jobs {count=5}';
    protected $description = 'Dispatch test jobs to the queue';

    public function handle()
    {
        $count = (int) $this->argument('count');

        for ($i = 0; $i < $count; $i++) {
            TestJob::dispatch();
        }

        $this->info("$count TestJob(s) dispatched.");
    }
}

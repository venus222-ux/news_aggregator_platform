<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\FetchNewsJob;

//Triggering the fetch
class NewsController extends Controller
{
    public function fetchNow()
    {
        FetchNewsJob::dispatch(); //Sends a job to the queue to fetch news asynchronously.
        return response()->json(['message' => 'News fetch job dispatched']);
    }
}

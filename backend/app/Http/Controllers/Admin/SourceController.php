<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Source;
use Illuminate\Http\Request;

class SourceController extends Controller
{
    public function index()
    {
        return response()->json(Source::latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:rss,api',
            'url' => 'required|url',
            'api_key' => 'nullable|string'
        ]);

        $source = Source::create($validated);

        return response()->json($source, 201);
    }

    public function update(Request $request, Source $source)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:rss,api',
            'url' => 'required|url',
            'api_key' => 'nullable|string'
        ]);

        $source->update($validated);

        return response()->json($source);
    }

    public function destroy(Source $source)
    {
        $source->delete();

        return response()->json([
            'message' => 'Source deleted'
        ]);
    }
}

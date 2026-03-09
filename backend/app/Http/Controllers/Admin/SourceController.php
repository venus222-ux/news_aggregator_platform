<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Source;
use Illuminate\Http\Request;

class SourceController extends Controller
{
    public function index()
    {
        return response()->json(Source::all());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'type' => 'required|in:api,rss',
            'url' => 'required|url',
            'api_key' => 'nullable|string'
        ]);

        $source = Source::create($data);

        return response()->json($source, 201);
    }

    public function destroy(Source $source)
    {
        $source->delete();
        return response()->json(['message' => 'Source deleted']);
    }
}

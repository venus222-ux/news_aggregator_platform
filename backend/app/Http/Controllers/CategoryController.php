<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    // List all categories
    public function index() {
        return response()->json(Category::all());
    }

    // CRUD - Admin only
public function store(Request $request) {
    $request->validate(['name' => 'required|unique:categories']);
    $category = Category::create([
        'name' => $request->name,
        'slug' => Str::slug($request->name),
    ]);
    return response()->json($category, 201);
}

public function update(Request $request, Category $category) {
    $request->validate(['name' => 'required|unique:categories,name,'.$category->id]);
    $category->update([
        'name' => $request->name,
        'slug' => Str::slug($request->name),
    ]);
    return response()->json($category);
}

    public function destroy(Category $category) {
        $category->delete();
        return response()->json(['message' => 'Category deleted']);
    }

    // User subscriptions
    public function subscribe(Category $category) {
        $user = Auth::user();
        $user->subscriptions()->syncWithoutDetaching($category->id);
        return response()->json(['message' => 'Subscribed']);
    }

    public function unsubscribe(Category $category) {
        $user = Auth::user();
        $user->subscriptions()->detach($category->id);
        return response()->json(['message' => 'Unsubscribed']);
    }

    public function mySubscriptions() {
        $user = Auth::user();
        return response()->json($user->subscriptions);
    }
}

<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\DataSource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class DataSourceController extends Controller
{
    public function __construct()
    {
    $this->middleware('auth:api');
    $this->middleware('admin')->only(['store', 'update', 'destroy']);
    }

    /**
     * GET /api/data-sources
     */
    public function index(): JsonResponse
    {
        $sources = DataSource::all();
        return response()->json($sources);
    }

    /**
     * GET /api/data-sources/{id}
     */
    public function show(int $id): JsonResponse
    {
        $source = DataSource::findOrFail($id);
        return response()->json($source);
    }

    /**
     * POST /api/data-sources
     */
    public function store(Request $request): JsonResponse
    {
        $attrs = $request->validate([
            'name'        => ['required','string','max:255','unique:data_sources,name'],
            'endpoint'    => ['required','url','max:1000'],
            'description' => ['nullable','string'],
        ]);

        $source = DataSource::create($attrs);

        return response()->json($source, 201);
    }

    /**
     * PUT /api/data-sources/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $source = DataSource::findOrFail($id);

        $attrs = $request->validate([
            'name'        => ['required','string','max:255', Rule::unique('data_sources','name')->ignore($source->id)],
            'endpoint'    => ['required','url','max:1000'],
            'description' => ['nullable','string'],
        ]);

        $source->update($attrs);

        return response()->json($source);
    }

    /**
     * DELETE /api/data-sources/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $source = DataSource::findOrFail($id);
        $source->delete();

        return response()->json(['message' => 'Data source deleted successfully.']);
    }
}

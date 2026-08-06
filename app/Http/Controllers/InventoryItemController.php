<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use Illuminate\Http\Request;

class InventoryItemController extends Controller
{
    public function index()
    {
        return response()->json(InventoryItem::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'item_name'         => 'required|string|max:255',
            'quantity_in_stock' => 'required|integer|min:0',
            'min_reorder_level' => 'required|integer|min:0',
            'unit'              => 'nullable|string',
        ]);

        $item = InventoryItem::create($validated);

        return response()->json([
            'message' => 'Inventory item added',
            'item'    => $item,
        ], 201);
    }

    public function updateStock(Request $request, InventoryItem $inventoryItem)
    {
        $validated = $request->validate([
            'quantity_in_stock' => 'required|integer|min:0',
        ]);

        $inventoryItem->update($validated);

        return response()->json([
            'message' => 'Stock updated successfully',
            'item'    => $inventoryItem,
        ]);
    }
}

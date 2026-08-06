<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_name',
        'quantity_in_stock',
        'min_reorder_level',
        'unit',
    ];

    protected $casts = [
        'quantity_in_stock' => 'integer',
        'min_reorder_level' => 'integer',
    ];
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Procedure extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'default_cost',
    ];

    protected $casts = [
        'default_cost' => 'decimal:2',
    ];

    public function patientProcedures(): HasMany
    {
        return $this->hasMany(PatientProcedure::class);
    }
}

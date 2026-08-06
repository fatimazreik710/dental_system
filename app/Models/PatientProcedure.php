<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PatientProcedure extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'invoice_id',
        'procedure_id',
        'tooth_number',
        'agreed_price',
        'status',
    ];

    protected $casts = [
        'agreed_price' => 'decimal:2',
        'tooth_number' => 'integer',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function procedure(): BelongsTo
    {
        return $this->belongsTo(Procedure::class);
    }
}

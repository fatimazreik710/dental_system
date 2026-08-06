<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'total_amount',
        'discount_amount',
        'discount_reason',
        'final_amount',
        'paid_amount',
        'balance_due',
        'status',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'final_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'balance_due' => 'decimal:2',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function procedures(): HasMany
    {
        return $this->hasMany(PatientProcedure::class);
    }

    /**
     * Recalculates total paid and balance due based on payments.
     */
    public function recalculateBalances(): void
    {
        $totalPaid = $this->payments()->sum('amount_paid');
        $this->paid_amount = $totalPaid;
        $this->balance_due = max(0, $this->final_amount - $totalPaid);

        if ($this->balance_due <= 0) {
            $this->status = 'Paid';
        } elseif ($totalPaid > 0) {
            $this->status = 'Partial';
        } else {
            $this->status = 'Unpaid';
        }

        $this->save();
    }
}

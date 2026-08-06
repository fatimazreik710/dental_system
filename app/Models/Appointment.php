<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'appointment_time',
        'status',
        'whatsapp_reminder_sent',
        'notes',
    ];

    protected $casts = [
        'appointment_time' => 'datetime',
        'whatsapp_reminder_sent' => 'boolean',
    ];

    /**
     * Serialize dates without timezone indicator so the frontend
     * treats them as local clinic time rather than UTC.
     */
    protected function serializeDate(\DateTimeInterface $date): string
    {
        return $date->format('Y-m-d H:i:s');
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }
}

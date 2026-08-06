<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Patient extends Model
{
    use HasFactory;

    protected $fillable = [
        'full_name',
        'phone_number',
        'age',
        'gender',
        'chief_complaint',
        'medical_history',
        'current_medications',
        'previous_dental_history',
        'oral_hygiene_habits',
        'has_xray',
        'xray_file_path',
    ];

    protected $casts = [
        'has_xray' => 'boolean',
        'age' => 'integer',
    ];

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    public function toothCharts(): HasMany
    {
        return $this->hasMany(ToothChart::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public function patientProcedures(): HasMany
    {
        return $this->hasMany(PatientProcedure::class);
    }
}

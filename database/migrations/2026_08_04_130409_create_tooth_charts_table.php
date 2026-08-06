<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tooth_charts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->onDelete('cascade');
            $table->integer('tooth_number'); // FDI System (11-48, 51-85)
            $table->enum('status', [
                'Healthy',
                'Missing',
                'Cavity',
                'Crown',
                'Extraction Planned',
                'Implant',
                'Endo Treated'
            ])->default('Healthy');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['patient_id', 'tooth_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tooth_charts');
    }
};

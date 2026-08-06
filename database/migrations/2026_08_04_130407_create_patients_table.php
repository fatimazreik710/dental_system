<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->string('full_name');
            $table->string('phone_number');
            $table->integer('age')->nullable();
            $table->enum('gender', ['Male', 'Female'])->nullable();

            // Medical & Dental Background
            $table->text('chief_complaint')->nullable();
            $table->text('medical_history')->nullable();
            $table->text('current_medications')->nullable();
            $table->text('previous_dental_history')->nullable();
            $table->string('oral_hygiene_habits')->nullable();
            $table->boolean('has_xray')->default(false);
            $table->string('xray_file_path')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};

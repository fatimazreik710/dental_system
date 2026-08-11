<?php

use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\InventoryItemController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\PatientProcedureController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ToothChartController;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;

Route::post('login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);

    /*
    |--------------------------------------------------------------------------
    | Patients & Appointments API
    |--------------------------------------------------------------------------
    */
    Route::apiResource('patients', PatientController::class);
    Route::apiResource('appointments', AppointmentController::class);
    Route::post('appointments/{appointment}/send-reminder', [AppointmentController::class, 'sendReminder']);

    /*
    |--------------------------------------------------------------------------
    | Interactive Dental Charting (FDI)
    |--------------------------------------------------------------------------
    */
    Route::get('patients/{patient}/tooth-charts', [ToothChartController::class, 'showByPatient']);
    Route::post('tooth-charts', [ToothChartController::class, 'updateOrCreate']);

    /*
    |--------------------------------------------------------------------------
    | Procedures, Invoices & Installments
    |--------------------------------------------------------------------------
    */
    Route::post('patient-procedures', [PatientProcedureController::class, 'store']);
    Route::apiResource('invoices', InvoiceController::class)->only(['index', 'store', 'show']);
    Route::post('payments', [PaymentController::class, 'store']);
    Route::delete('payments/{payment}', [PaymentController::class, 'destroy']);

    /*
    |--------------------------------------------------------------------------
    | Inventory Tracking
    |--------------------------------------------------------------------------
    */
    Route::get('inventory', [InventoryItemController::class, 'index']);
    Route::post('inventory', [InventoryItemController::class, 'store']);
    Route::patch('inventory/{inventoryItem}/stock', [InventoryItemController::class, 'updateStock']);
});

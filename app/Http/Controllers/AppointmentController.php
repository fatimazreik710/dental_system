<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    public function index()
    {
        $appointments = Appointment::with('patient')->latest('appointment_time')->get();
        return response()->json($appointments);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id'       => 'required|exists:patients,id',
            'appointment_time' => 'required|date',
            'status'           => 'nullable|in:Scheduled,Completed,Cancelled,No-Show',
            'notes'            => 'nullable|string',
        ]);

        $appointment = Appointment::create($validated);

        return response()->json([
            'message'     => 'Appointment scheduled successfully',
            'appointment' => $appointment,
        ], 201);
    }

    public function update(Request $request, Appointment $appointment)
    {
        $validated = $request->validate([
            'patient_id'             => 'sometimes|exists:patients,id',
            'appointment_time'       => 'sometimes|date',
            'status'                 => 'sometimes|in:Scheduled,Completed,Cancelled,No-Show',
            'whatsapp_reminder_sent' => 'sometimes|boolean',
            'notes'                  => 'nullable|string',
        ]);

        $appointment->update($validated);

        return response()->json([
            'message'     => 'Appointment updated',
            'appointment' => $appointment,
        ]);
    }

    public function destroy(Appointment $appointment)
    {
        $appointment->delete();
        return response()->json(['message' => 'Appointment cancelled/deleted']);
    }
}

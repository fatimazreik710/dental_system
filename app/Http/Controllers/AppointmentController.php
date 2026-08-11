<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;
use Carbon\Carbon;

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

    public function sendReminder(Appointment $appointment)
    {
        $appointment->load('patient');

        $appointment->update(['whatsapp_reminder_sent' => true]);

        $patient   = $appointment->patient;
        $phone     = preg_replace('/[^0-9]/', '', $patient->phone_number);
        // Ensure international format (strip leading 0, add country code if missing)
        if (str_starts_with($phone, '0')) {
            $phone = '961' . substr($phone, 1); // Lebanon default — adjust as needed
        }

        $apptTime  = Carbon::parse($appointment->appointment_time);
        $dateAr    = $apptTime->format('d/m/Y');
        $timeAr    = $apptTime->format('H:i');

        $message = "مرحباً {$patient->full_name}\n";
        $message .= "تذكير بموعدك في عيادة الأسنان غداً\n";
        $message .= "التاريخ: {$dateAr}\n";
        $message .= "الوقت: {$timeAr}\n";
        $message .= "يرجى الحضور في الموعد المحدد أو الاتصال بنا في حال الرغبة بإعادة الجدولة.\n";
        $message .= "شكراً لك!";

        return response()->json([
            'phone'       => $phone,
            'message'     => $message,
            'whatsapp_url' => 'https://wa.me/' . $phone . '?text=' . rawurlencode($message),
            'appointment' => $appointment,
        ]);
    }
}

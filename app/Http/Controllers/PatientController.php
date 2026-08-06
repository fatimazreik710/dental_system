<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PatientController extends Controller
{
    public function index(Request $request)
    {
        $query = Patient::with(['invoices.payments', 'toothCharts'])->latest();

        if ($request->query('all')) {
            return response()->json($query->get());
        }

        return response()->json($query->paginate(15));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'full_name'               => 'required|string|max:255',
            'phone_number'            => 'required|string|max:20',
            'age'                     => 'nullable|integer',
            'gender'                  => 'nullable|in:Male,Female',
            'chief_complaint'         => 'nullable|string',
            'medical_history'         => 'nullable|string',
            'current_medications'     => 'nullable|string',
            'previous_dental_history' => 'nullable|string',
            'oral_hygiene_habits'     => 'nullable|string',
            'xray_file'               => 'nullable|file|mimes:jpeg,png,pdf,jpg|max:10240',
        ]);

        if ($request->hasFile('xray_file')) {
            $path = $request->file('xray_file')->store('xrays', 'public');
            $validated['xray_file_path'] = $path;
            $validated['has_xray'] = true;
        }

        $patient = Patient::create($validated);

        return response()->json([
            'message' => 'Patient registered successfully',
            'patient' => $patient,
        ], 201);
    }

    public function show(Patient $patient)
    {
        $patient->load(['appointments', 'toothCharts', 'invoices.payments', 'patientProcedures.procedure']);
        return response()->json($patient);
    }

    public function update(Request $request, Patient $patient)
    {
        $validated = $request->validate([
            'full_name'               => 'sometimes|string|max:255',
            'phone_number'            => 'sometimes|string|max:20',
            'age'                     => 'nullable|integer',
            'gender'                  => 'nullable|in:Male,Female',
            'chief_complaint'         => 'nullable|string',
            'medical_history'         => 'nullable|string',
            'current_medications'     => 'nullable|string',
            'previous_dental_history' => 'nullable|string',
            'oral_hygiene_habits'     => 'nullable|string',
            'xray_file'               => 'nullable|file|mimes:jpeg,png,pdf,jpg|max:10240',
        ]);

        if ($request->hasFile('xray_file')) {
            if ($patient->xray_file_path) {
                Storage::disk('public')->delete($patient->xray_file_path);
            }
            $validated['xray_file_path'] = $request->file('xray_file')->store('xrays', 'public');
            $validated['has_xray'] = true;
        }

        $patient->update($validated);

        return response()->json([
            'message' => 'Patient details updated',
            'patient' => $patient,
        ]);
    }

    public function destroy(Patient $patient)
    {
        if ($patient->xray_file_path) {
            Storage::disk('public')->delete($patient->xray_file_path);
        }
        $patient->delete();

        return response()->json(['message' => 'Patient deleted successfully']);
    }
}

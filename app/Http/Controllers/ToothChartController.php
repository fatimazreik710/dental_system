<?php

namespace App\Http\Controllers;

use App\Models\ToothChart;
use Illuminate\Http\Request;

class ToothChartController extends Controller
{
    public function showByPatient($patientId)
    {
        $charts = ToothChart::where('patient_id', $patientId)->get();
        return response()->json($charts);
    }

    public function updateOrCreate(Request $request)
    {
        $validated = $request->validate([
            'patient_id'   => 'required|exists:patients,id',
            'tooth_number' => 'required|integer|min:11|max:85',
            'status'       => 'required|in:Healthy,Missing,Cavity,Crown,Extraction Planned,Implant,Endo Treated',
            'notes'        => 'nullable|string',
        ]);

        $chart = ToothChart::updateOrCreate(
            [
                'patient_id'   => $validated['patient_id'],
                'tooth_number' => $validated['tooth_number'],
            ],
            [
                'status' => $validated['status'],
                'notes'  => $validated['notes'] ?? null,
            ]
        );

        return response()->json([
            'message' => 'Tooth status saved',
            'chart'   => $chart,
        ]);
    }
}

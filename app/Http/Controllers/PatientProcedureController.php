<?php

namespace App\Http\Controllers;

use App\Models\PatientProcedure;
use App\Models\Procedure;
use Illuminate\Http\Request;

class PatientProcedureController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id'   => 'required|exists:patients,id',
            'procedure_id' => 'required|exists:procedures,id',
            'tooth_number' => 'nullable|integer|min:11|max:85',
            'agreed_price' => 'nullable|numeric|min:0',
            'status'       => 'nullable|in:Planned,Completed',
        ]);

        // Auto-fetch standard price if custom price not explicitly passed
        if (!isset($validated['agreed_price'])) {
            $procedure = Procedure::findOrFail($validated['procedure_id']);
            $validated['agreed_price'] = $procedure->default_cost;
        }

        $patientProcedure = PatientProcedure::create($validated);

        return response()->json([
            'message'           => 'Procedure recorded',
            'patient_procedure' => $patientProcedure,
        ], 201);
    }
}

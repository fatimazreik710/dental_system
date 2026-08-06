<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\PatientProcedure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InvoiceController extends Controller
{
    public function index()
    {
        $invoices = Invoice::with(['patient', 'payments', 'procedures.procedure'])->latest()->paginate(15);
        return response()->json($invoices);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id'        => 'required|exists:patients,id',
            'procedure_ids'     => 'nullable|array',
            'procedure_ids.*'   => 'exists:patient_procedures,id',
            'discount_amount'   => 'nullable|numeric|min:0',
            'discount_reason'   => 'nullable|string',
            'amount'            => 'nullable|numeric|min:0', // Manual amount
        ]);

        return DB::transaction(function () use ($validated) {
            $discount = $validated['discount_amount'] ?? 0.00;
            $procedureIds = $validated['procedure_ids'] ?? [];

            // Fetch procedures and compute raw total
            if (count($procedureIds) > 0) {
                $procedures = PatientProcedure::whereIn('id', $procedureIds)->get();
                $totalAmount = $procedures->sum('agreed_price');
            } else {
                $totalAmount = $validated['amount'] ?? 0.00;
            }
            
            $finalAmount = max(0, $totalAmount - $discount);

            $invoice = Invoice::create([
                'patient_id'      => $validated['patient_id'],
                'total_amount'    => $totalAmount,
                'discount_amount' => $discount,
                'discount_reason' => $validated['discount_reason'] ?? null,
                'final_amount'    => $finalAmount,
                'paid_amount'     => 0.00,
                'balance_due'     => $finalAmount,
                'status'          => 'Unpaid',
            ]);

            // Link procedures to this invoice
            if (count($procedureIds) > 0) {
                PatientProcedure::whereIn('id', $procedureIds)
                    ->update(['invoice_id' => $invoice->id]);
            }

            return response()->json([
                'message' => 'Invoice created successfully',
                'invoice' => $invoice->load('procedures'),
            ], 201);
        });
    }

    public function show(Invoice $invoice)
    {
        return response()->json($invoice->load(['patient', 'payments', 'procedures.procedure']));
    }
}

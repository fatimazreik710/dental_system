<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'invoice_id'     => 'required|exists:invoices,id',
            'amount_paid'    => 'required|numeric|gt:0',
            'payment_date'   => 'required|date',
            'payment_method' => 'nullable|string',
            'notes'          => 'nullable|string',
        ]);

        $invoice = Invoice::findOrFail($validated['invoice_id']);

        if ($validated['amount_paid'] > $invoice->balance_due) {
            return response()->json([
                'error' => "Payment amount exceeding balance due ($ {$invoice->balance_due})",
            ], 422);
        }

        $payment = Payment::create($validated);

        return response()->json([
            'message' => 'Payment logged successfully',
            'payment' => $payment,
            'invoice' => $invoice->fresh(),
        ], 201);
    }

    public function destroy(Payment $payment)
    {
        $invoice = clone $payment->invoice;
        $payment->delete();

        return response()->json([
            'message' => 'Payment removed',
            'invoice' => $invoice->fresh(),
        ]);
    }
}

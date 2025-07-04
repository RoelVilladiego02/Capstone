<?php

namespace App\Http\Controllers;

use App\Models\Bill;
use Illuminate\Http\Request;

class BillingController extends Controller
{
    public function index()
    {
        return Bill::all();
    }

    public function show($id)
    {
        return Bill::findOrFail($id);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'amount' => 'required|numeric',
            'status' => 'required|string',
            'due_date' => 'required|date',
            'paid_at' => 'nullable|date',
            'description' => 'nullable|string',
        ]);
        return Bill::create($validated);
    }

    public function update(Request $request, $id)
    {
        $bill = Bill::findOrFail($id);
        $validated = $request->validate([
            'patient_id' => 'sometimes|exists:patients,id',
            'amount' => 'sometimes|numeric',
            'status' => 'sometimes|string',
            'due_date' => 'sometimes|date',
            'paid_at' => 'nullable|date',
            'description' => 'nullable|string',
        ]);
        $bill->update($validated);
        return $bill;
    }

    public function destroy($id)
    {
        Bill::destroy($id);
        return response()->noContent();
    }
}

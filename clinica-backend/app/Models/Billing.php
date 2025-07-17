<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class Billing extends Model
{
    use HasFactory;

    protected $table = 'bills';

    protected $fillable = [
        'appointment_id', 'patient_id', 'doctor_id', 'amount', 'status', 'payment_method', 'due_date', 'receipt_no', 'type', 'description'
    ];

    // Allowed payment methods
    public const PAYMENT_METHODS = [
        'credit_card' => 'Credit Card',
        'cash' => 'Cash',
        'gcash' => 'GCash',
        'paymaya' => 'PayMaya',
    ];

    /**
     * Get allowed payment methods (for forms, validation, etc.)
     */
    public static function allowedPaymentMethods()
    {
        return array_keys(self::PAYMENT_METHODS);
    }

    /**
     * Get display name for a payment method
     */
    public static function paymentMethodDisplay($method)
    {
        return self::PAYMENT_METHODS[$method] ?? $method;
    }

    // Relationship to Patient
    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    // Relationship to Doctor (Doctor model, not User)
    public function doctor()
    {
        return $this->belongsTo(Doctor::class, 'doctor_id');
    }

    // Relationship to Appointment
    public function appointment()
    {
        return $this->belongsTo(Appointment::class, 'appointment_id');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'appointment_id' => 'nullable|exists:appointments,id',
            'patient_id' => 'required|exists:patients,id',
            'doctor_id' => 'required|exists:doctors,id',
            'amount' => 'required|numeric',
            'status' => 'required|string',
            'payment_method' => 'required|string',
            'due_date' => 'required|date',
            'receipt_no' => 'required|string',
            'type' => 'required|string',
            'description' => 'nullable|string',
        ]);
        return Billing::create($validated);
    }

    public function updateFromRequest(Request $request, $id)
    {
        $bill = Billing::findOrFail($id);
        $validated = $request->validate([
            'patient_id' => 'sometimes|exists:patients,id',
            'doctor_id' => 'sometimes|exists:doctors,id',
            // ... rest unchanged ...
        ]);
        $bill->update($validated);
        // ... rest unchanged ...
    }
}

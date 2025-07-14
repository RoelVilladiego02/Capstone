<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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

    // Relationship to Doctor (User)
    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Prescription extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id', 
        'doctor_id', 
        'date', 
        'medications', 
        'diagnosis',
        'notes', 
        'status',
        'next_checkup'
    ];

    protected $casts = [
        'medications' => 'array',
        'date' => 'date',
        'next_checkup' => 'date'
    ];

    // Relationships
    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }
}

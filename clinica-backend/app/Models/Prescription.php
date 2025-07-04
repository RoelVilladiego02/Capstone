<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Prescription extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id', 'doctor_id', 'date', 'medication', 'dosage', 'instructions', 'notes'
    ];
}

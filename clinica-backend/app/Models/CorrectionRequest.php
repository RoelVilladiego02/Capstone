<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CorrectionRequest extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'medical_record_id',
        'request',
        'status',
        'admin_response',
    ];
    public function user() { return $this->belongsTo(User::class); }
    public function medicalRecord() { return $this->belongsTo(MedicalRecord::class); }
} 
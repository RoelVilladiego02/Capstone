<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UploadedDocument extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'medical_record_id',
        'file_path',
        'original_name',
        'type',
    ];
    public function user() { return $this->belongsTo(User::class); }
    public function medicalRecord() { return $this->belongsTo(MedicalRecord::class); }
} 
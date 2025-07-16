<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Doctor extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'specialization',
        'branch_id',
        'available_days',
        'time_availability',
        'currently_consulting',
    ];

    protected $casts = [
        'available_days' => 'array',
        'time_availability' => 'array',
        'currently_consulting' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
} 
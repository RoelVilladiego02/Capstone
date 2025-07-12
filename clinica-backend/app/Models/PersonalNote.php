<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PersonalNote extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'note',
    ];
    public function user() { return $this->belongsTo(User::class); }
} 
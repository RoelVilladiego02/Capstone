<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'contact_name', 'phone', 'email', 'address', 'category', 'status', 'rating'
    ];

    protected $casts = [
        'rating' => 'decimal:1'
    ];

    // Relationships
    public function inventoryItems()
    {
        return $this->hasMany(InventoryItem::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'Active');
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    // Accessors
    public function getLastOrderDateAttribute()
    {
        return $this->orders()->latest('order_date')->first()?->order_date;
    }

    public function getTotalOrdersAttribute()
    {
        return $this->orders()->count();
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'description', 'quantity', 'unit', 'price', 'threshold', 'category', 'location', 'supplier_id'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'quantity' => 'integer',
        'threshold' => 'integer'
    ];

    // Relationships
    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    // Accessors
    public function getStatusAttribute()
    {
        if ($this->quantity === 0) {
            return 'Out of Stock';
        } elseif ($this->quantity <= $this->threshold) {
            return 'Low Stock';
        } else {
            return 'In Stock';
        }
    }

    public function getStockPercentageAttribute()
    {
        if ($this->threshold === 0) return 100;
        return min(100, ($this->quantity / $this->threshold) * 100);
    }

    // Scopes
    public function scopeLowStock($query)
    {
        return $query->whereRaw('quantity <= threshold');
    }

    public function scopeOutOfStock($query)
    {
        return $query->where('quantity', 0);
    }

    public function scopeInStock($query)
    {
        return $query->where('quantity', '>', 0);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }
}

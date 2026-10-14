<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'razorpay_order_id',
        'razorpay_payment_id',
        'customer_name',
        'customer_email',
        'customer_mobile',
        'country',
        'state',
        'city',
        'pincode',
        'address',
        'subtotal',
        'tax',
        'total',
        'status',          // pending | paid | failed
        'failure_reason',
        'paid_at',
    ];

    protected $casts = [
        'paid_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
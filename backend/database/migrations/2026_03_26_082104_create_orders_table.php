<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('razorpay_payment_id')->unique();
            $table->string('customer_name');
            $table->string('customer_email');
            $table->string('customer_mobile');
            $table->string('country');
            $table->string('state')->nullable();   // only for India
            $table->string('city');
            $table->string('pincode');
            $table->string('address')->nullable();
            $table->decimal('subtotal', 10, 2);
            $table->decimal('tax',      10, 2);
            $table->decimal('total',    10, 2);
            $table->string('status')->default('paid'); // paid | refunded | failed
            $table->timestamps();
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->restrictOnDelete();
            $table->integer('quantity');
            $table->decimal('price', 10, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
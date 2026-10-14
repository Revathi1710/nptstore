<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
public function up()
{
    Schema::table('users', function (Blueprint $table) {
        $table->string('mobile_number')->nullable();
        $table->string('otp')->nullable();
        $table->timestamp('otp_expires_at')->nullable();
        $table->boolean('is_verified')->default(0);
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'mobile_number',
                'otp',
                'otp_expires_at',
                'is_verified'
            ]);
   });
    }
};
<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
   use App\Models\Admin;
use Illuminate\Support\Facades\Hash;
class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */


public function run()
{
    Admin::create([
        'username' => 'admin',
        'password' => Hash::make('12345678'),
    ]);
}
}

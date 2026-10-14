<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Admin;
use Illuminate\Support\Facades\Hash;

class AdminAuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required',
            'password' => 'required'
        ]);

        $admin = Admin::where('username', $request->username)->first();

        if (!$admin || !Hash::check($request->password, $admin->password)) {
            return response()->json([
                'message' => 'Invalid username or password'
            ], 401);
        }

        $token = $admin->createToken('admin-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'admin' => $admin
        ]);
    }
    public function changePassword(Request $request)
{
    $request->validate([
        'old_password' => 'required',
        'new_password' => 'required|min:6'
    ]);

    $admin = $request->user();

    // Check old password
    if (!Hash::check($request->old_password, $admin->password)) {
        return response()->json([
            'message' => 'Old password is incorrect'
        ], 400);
    }

    // Update new password
    $admin->password = Hash::make($request->new_password);
    $admin->save();

    return response()->json([
        'message' => 'Password updated successfully'
    ]);
}
}

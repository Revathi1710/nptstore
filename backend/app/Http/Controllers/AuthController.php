<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

/**
 * Passwordless auth (email code only, like Shopify):
 *   POST /auth/send-code    { email }        -> emails a 6-digit code (creates the account if new)
 *   POST /auth/verify-code  { email, otp }   -> returns { token, user }
 *
 * There are no passwords for customers. The `password` column is filled with a random
 * unusable value only because the column is NOT NULL.
 */
class AuthController extends Controller
{
    private const CODE_MINUTES    = 10;
    private const RESEND_SECONDS  = 30;
    private const MAX_ATTEMPTS    = 5;

    // SEND CODE (also used for "Resend code")
    public function sendCode(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $email = strtolower(trim($request->email));

        $user = User::where('email', $email)->first();

        // Cooldown: one code per RESEND_SECONDS
        if ($user && $user->otp_expires_at) {
            $sentAt = Carbon::parse($user->otp_expires_at)->subMinutes(self::CODE_MINUTES);
            if (now()->lt($sentAt->copy()->addSeconds(self::RESEND_SECONDS))) {
                return response()->json(['message' => 'Please wait a few seconds before asking for another code.'], 429);
            }
        }

        // "Sign in or create an account": a new email silently gets an account
        if (!$user) {
            $user = User::create([
                'name'          => Str::before($email, '@'),
                'email'         => $email,
                'mobile_number' => '',
                'password'      => Hash::make(Str::random(32)),   // never used
                'is_verified'   => 0,
            ]);
        }

        $otp = (string) random_int(100000, 999999);

        $user->otp            = hash('sha256', $otp);   // stored hashed
        $user->otp_expires_at = now()->addMinutes(self::CODE_MINUTES);
        $user->save();

        Cache::forget("otp_attempts:{$email}");

        try {
            // Branded HTML email: resources/views/emails/otp.blade.php
            Mail::send(
                'emails.otp',
                [
                    'otp'     => $otp,
                    'minutes' => self::CODE_MINUTES,
                    'email'   => $email,
                ],
                fn ($m) => $m->to($email)->subject('Your NPTStore sign-in code')
            );
        } catch (\Throwable $e) {
            // mail server problem (wrong SMTP settings, blocked port, ...): say so clearly and log it
            Log::error('Sign-in code email failed: ' . $e->getMessage());
            return response()->json(['message' => 'We could not send the email right now. Please try again in a moment.'], 502);
        }

        return response()->json(['message' => 'Code sent']);
    }

    // VERIFY CODE -> logged in
    public function verifyCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp'   => 'required|digits:6',
        ]);

        $email = strtolower(trim($request->email));
        $key   = "otp_attempts:{$email}";

        if ((int) Cache::get($key, 0) >= self::MAX_ATTEMPTS) {
            return response()->json(['message' => 'Too many wrong codes. Please request a new code.'], 429);
        }

        $user = User::where('email', $email)->first();

        if (!$user || !$user->otp) {
            return response()->json(['message' => 'That code is wrong or has expired.'], 400);
        }

        if (!$user->otp_expires_at || now()->gt($user->otp_expires_at)) {
            return response()->json(['message' => 'That code has expired. Request a new one.'], 400);
        }

        if (!hash_equals($user->otp, hash('sha256', trim($request->otp)))) {
            Cache::put($key, (int) Cache::get($key, 0) + 1, now()->addMinutes(self::CODE_MINUTES));
            return response()->json(['message' => 'That code is wrong or has expired.'], 400);
        }

        // Inbox proven. Works for brand-new accounts AND accounts created by guest checkout.
        $user->otp            = null;
        $user->otp_expires_at = null;
        $user->is_verified    = 1;
        $user->save();
        Cache::forget($key);

        // Revoke every older session. If someone typed this email at checkout before the real
        // owner did, the session they got at checkout dies here, once the owner proves the inbox.
        $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Signed in',
            'token'   => $token,
            'user'    => $user,
        ]);
    }

    // GET ALL USERS (ADMIN)
    public function allUsers(Request $request)
    {
        $perPage = 10;
        $search  = $request->query('search');

        $query = User::where('is_verified', 1)->latest();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('mobile_number', 'like', "%{$search}%");
            });
        }

        $users = $query->paginate($perPage);

        $users->getCollection()->transform(function ($user) {
            $user->order_count = Order::where('user_id', $user->id)->count();
            $user->total_spent = Order::where('user_id', $user->id)
                                      ->where('status', 'paid')
                                      ->sum('total');
            return $user;
        });

        return response()->json([
            'message' => 'Users fetched successfully',
            'data'    => $users->items(),
            'meta'    => [
                'current_page' => $users->currentPage(),
                'last_page'    => $users->lastPage(),
                'total'        => $users->total(),
                'per_page'     => $users->perPage(),
            ]
        ]);
    }

    // LOGOUT
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    // GET AUTHENTICATED USER DATA
    public function getProfile(Request $request)
    {
        return response()->json(['user' => $request->user()]);
    }

    // UPDATE PROFILE (name / mobile only, no passwords)
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'mobile_number' => 'sometimes|required|string|max:15',
        ]);

        if ($request->has('name')) $user->name = $request->name;
        if ($request->has('mobile_number')) $user->mobile_number = $request->mobile_number;

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user
        ]);
    }
}
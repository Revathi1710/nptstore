<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Your default landing page
Route::get('/', function () {
    return view('welcome');
});

// The fix for your Email/SMTP settings
Route::get('/clear-everything', function() {
    try {
        // This is the most important command for your .env changes
        Artisan::call('config:clear');
        
        // These are secondary; if they fail, the config will still be cleared
        Artisan::call('view:clear');
        Artisan::call('route:clear');
        
        return "Config and View cache cleared successfully! You can now test the OTP mail.";
    } catch (\Exception $e) {
        return "Error clearing cache: " . $e->getMessage();
    }
});
<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['*'],

    'allowed_origins_patterns' => [],

    // ✅ FIX: Must include 'Authorization' or the Bearer token gets stripped
    // by the browser preflight check, making every logged-in cart request
    // appear as a guest request and returning an empty cart.
    'allowed_headers' => ['Content-Type', 'X-Session-Id', 'Authorization', 'Accept', 'X-Requested-With'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
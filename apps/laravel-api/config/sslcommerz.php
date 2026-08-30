<?php

return [
    'store_id' => env('SSLCZ_STORE_ID'),
    'store_password' => env('SSLCZ_STORE_PASSWORD'),
    'sandbox' => filter_var(env('SSLCZ_TESTMODE', true), FILTER_VALIDATE_BOOL),

    'session_path' => '/gwprocess/v4/api.php',
    'validation_path' => '/validator/api/validationserverAPI.php',

    'callback_paths' => [
        'success' => '/payments/sslcommerz/success',
        'fail' => '/payments/sslcommerz/fail',
        'cancel' => '/payments/sslcommerz/cancel',
        'ipn' => '/payments/sslcommerz/ipn',
    ],
];

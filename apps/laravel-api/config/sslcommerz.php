<?php

return [

    /*
    |--------------------------------------------------------------------------
    | SSLCOMMERZ Configuration
    |--------------------------------------------------------------------------
    |
    | Store ID and Store Password are obtained from the SSLCOMMERZ merchant
    | panel. Set SSLCOMMERZ_SANDBOX=true to use the sandbox environment.
    |
    */

    'store_id' => env('SSLCOMMERZ_STORE_ID', ''),

    'store_password' => env('SSLCOMMERZ_STORE_PASSWORD', ''),

    'sandbox' => env('SSLCOMMERZ_SANDBOX', true),

    'success_url' => env('SSLCOMMERZ_SUCCESS_URL', ''),

    'fail_url' => env('SSLCOMMERZ_FAIL_URL', ''),

    'cancel_url' => env('SSLCOMMERZ_CANCEL_URL', ''),

    'ipn_url' => env('SSLCOMMERZ_IPN_URL', ''),

];
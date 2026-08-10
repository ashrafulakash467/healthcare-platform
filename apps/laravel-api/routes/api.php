<?php

use App\Http\Controllers\Api\V1\AdminController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\AppointmentController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\DoctorController;
use App\Http\Controllers\Api\V1\MedicalRecordController;
use App\Http\Controllers\Api\V1\ProfileController;
use Illuminate\Support\Facades\Route;

Route::get('health', function () {
    return response()->json([
        'status' => 'ok',
        'service' => 'laravel-api',
    ]);
});

Route::post('patient/login', [AuthController::class, 'login'])->defaults('role', 'patient');
Route::post('patient/register', [AuthController::class, 'register'])->defaults('role', 'patient');
Route::post('doctor/login', [AuthController::class, 'login'])->defaults('role', 'doctor');
Route::post('doctor/register', [AuthController::class, 'register'])->defaults('role', 'doctor');
Route::post('admin/login', [AuthController::class, 'login'])->defaults('role', 'admin');
Route::post('patient/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('patient/reset-password', [AuthController::class, 'resetPassword']);
Route::get('doctor/search', [DoctorController::class, 'search']);
Route::get('doctor/public/{doctorId}', [DoctorController::class, 'show']);
Route::get('doctor-images/{filename}', [DoctorController::class, 'image']);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('me', [AuthController::class, 'me']);
    Route::get('profile', [ProfileController::class, 'show']);

    Route::get('dashboard', [DashboardController::class, 'index']);
    Route::get('patient/me', [AuthController::class, 'me'])->middleware('role:patient|admin|super-admin');
    Route::get('doctor/me', [AuthController::class, 'me'])->middleware('role:doctor|admin|super-admin');
    Route::get('admin/me', [AuthController::class, 'me'])->middleware('role:admin|super-admin');
    Route::get('appointment/my', [AppointmentController::class, 'my']);
    Route::get('medical-records', [MedicalRecordController::class, 'index'])->middleware('role:patient|doctor|admin|super-admin');

    Route::middleware('role:admin|super-admin')->group(function (): void {
        Route::get('admin/dashboard', [DashboardController::class, 'admin']);
        Route::get('admin/doctor-verifications', [AdminController::class, 'index']);
        Route::get('admin/users', [AdminController::class, 'users']);
        Route::patch('admin/doctor-verifications/{doctorId}/decision', [AdminController::class, 'decision']);
        Route::get('admin/doctors', [DoctorController::class, 'adminIndex']);
        Route::post('admin/doctors', [DoctorController::class, 'adminStore']);
        Route::put('admin/doctors/{doctorId}', [DoctorController::class, 'adminUpdate']);
        Route::delete('admin/doctors/{doctorId}', [DoctorController::class, 'adminDestroy']);
    });

    Route::middleware('role:doctor|admin|super-admin')->group(function (): void {
        Route::get('doctor/dashboard', [DashboardController::class, 'doctor']);
        Route::post('consultations/{appointmentId}/notes', [MedicalRecordController::class, 'storeNote']);
        Route::post('consultations/{appointmentId}/prescriptions', [MedicalRecordController::class, 'storePrescription']);
    });

    Route::middleware('role:patient|admin|super-admin')->group(function (): void {
        Route::get('patient/dashboard', [DashboardController::class, 'patient']);
        Route::get('appointment/booking-options', [AppointmentController::class, 'bookingOptions']);
        Route::get('appointment/available-dates', [AppointmentController::class, 'availableDates']);
        Route::get('appointment/available-slots', [AppointmentController::class, 'availableSlots']);
        Route::post('appointment/book', [AppointmentController::class, 'book']);
        Route::post('appointment/cancel', [AppointmentController::class, 'cancel']);
        Route::post('appointment/{appointmentId}/payment', [AppointmentController::class, 'payment']);
        Route::get('appointment/reschedule-options', [AppointmentController::class, 'rescheduleOptions']);
        Route::get('appointment/reschedule-slots', [AppointmentController::class, 'rescheduleSlots']);
        Route::post('appointment/reschedule', [AppointmentController::class, 'reschedule']);
    });

    Route::middleware('role:hospital|admin|super-admin')->group(function (): void {
        Route::get('hospital/dashboard', [DashboardController::class, 'hospital']);
    });
});

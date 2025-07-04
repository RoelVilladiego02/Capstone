<?php

use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

// Users, Appointments, Patients, Medical Records, Billing, Inventory, Orders, Suppliers, Prescriptions, Analytics, Settings, Audit Logs
Route::middleware('auth:sanctum')->group(function () {
    // Users
    Route::get('/users', [App\Http\Controllers\UserController::class, 'index']);
    Route::get('/users/{id}', [App\Http\Controllers\UserController::class, 'show']);
    Route::post('/users', [App\Http\Controllers\UserController::class, 'store']);
    Route::put('/users/{id}', [App\Http\Controllers\UserController::class, 'update']);
    Route::delete('/users/{id}', [App\Http\Controllers\UserController::class, 'destroy']);

    // Appointments
    Route::apiResource('appointments', App\Http\Controllers\AppointmentController::class);

    // Patients
    Route::apiResource('patients', App\Http\Controllers\PatientController::class);

    // Medical Records
    Route::apiResource('medical-records', App\Http\Controllers\MedicalRecordController::class);

    // Billing
    Route::apiResource('billing', App\Http\Controllers\BillingController::class);

    // Inventory
    Route::apiResource('inventory', App\Http\Controllers\InventoryController::class);

    // Orders
    Route::apiResource('orders', App\Http\Controllers\OrderController::class);

    // Suppliers
    Route::apiResource('suppliers', App\Http\Controllers\SupplierController::class);

    // Prescriptions
    Route::apiResource('prescriptions', App\Http\Controllers\PrescriptionController::class);

    // Analytics
    Route::get('/analytics/summary', [App\Http\Controllers\AnalyticsController::class, 'summary']);
    Route::get('/analytics/patients', [App\Http\Controllers\AnalyticsController::class, 'patients']);
    Route::get('/analytics/visits', [App\Http\Controllers\AnalyticsController::class, 'visits']);
    Route::get('/analytics/doctors', [App\Http\Controllers\AnalyticsController::class, 'doctors']);
    Route::get('/analytics/revenue', [App\Http\Controllers\AnalyticsController::class, 'revenue']);

    // Settings
    Route::get('/settings', [App\Http\Controllers\SettingsController::class, 'index']);
    Route::put('/settings', [App\Http\Controllers\SettingsController::class, 'update']);

    // Audit Logs
    Route::get('/audit-logs', [App\Http\Controllers\AuditLogController::class, 'index']);
});

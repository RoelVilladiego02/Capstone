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
    
    // Doctor endpoints
    Route::apiResource('doctors', App\Http\Controllers\DoctorController::class);

    // Appointments - Place specific routes before resource routes
    Route::get('/appointments/check-availability', [App\Http\Controllers\AppointmentController::class, 'checkAvailability']);
    Route::get('/appointments/check-patient-date', [App\Http\Controllers\AppointmentController::class, 'checkPatientDateAvailability']);
    Route::post('/appointments/check-patient-doctor-time-conflict', [
        App\Http\Controllers\AppointmentController::class, 'checkPatientDoctorTimeConflict'
    ]);
    Route::post('/appointments/check-patient-time-conflict', [
        App\Http\Controllers\AppointmentController::class, 'checkPatientTimeConflict'
    ]);
    Route::apiResource('appointments', App\Http\Controllers\AppointmentController::class);
    Route::post('/appointments/{id}/check-in', [App\Http\Controllers\AppointmentController::class, 'checkIn']);
    Route::get('/doctors/{doctorId}/appointments', [App\Http\Controllers\AppointmentController::class, 'doctorAppointments']);
    Route::get('/doctors/{doctorId}/todays-appointments', [App\Http\Controllers\AppointmentController::class, 'todaysDoctorAppointments']);
    Route::get('/doctors/{doctorId}/teleconsultations', [App\Http\Controllers\AppointmentController::class, 'upcomingTeleconsultations']);

    // Patients - IMPORTANT: Specific routes must come BEFORE resource routes
    Route::get('/patients/me', [App\Http\Controllers\PatientController::class, 'me']);
    Route::apiResource('patients', App\Http\Controllers\PatientController::class);

    // Medical Records
    Route::get('/medical-records', [App\Http\Controllers\MedicalRecordController::class, 'index']);
    Route::get('/medical-records/{id}', [App\Http\Controllers\MedicalRecordController::class, 'show']);
    Route::post('/medical-records', [App\Http\Controllers\MedicalRecordController::class, 'store'])->middleware('medical.record.permission');
    Route::put('/medical-records/{id}', [App\Http\Controllers\MedicalRecordController::class, 'update'])->middleware('medical.record.permission');
    Route::delete('/medical-records/{id}', [App\Http\Controllers\MedicalRecordController::class, 'destroy'])->middleware('medical.record.permission');
    Route::post('/medical-records/session', [App\Http\Controllers\MedicalRecordController::class, 'createFromSession'])->middleware('medical.record.permission');
    Route::put('/medical-records/{id}/session', [App\Http\Controllers\MedicalRecordController::class, 'updateFromSession'])->middleware('medical.record.permission');

    // Billing
    Route::get('/billing/my-bills', [App\Http\Controllers\BillingController::class, 'myBills']);
    Route::apiResource('billing', App\Http\Controllers\BillingController::class);

    // Inventory
    Route::get('/inventory/low-stock', [App\Http\Controllers\InventoryController::class, 'lowStock']);
    Route::get('/inventory/analytics', [App\Http\Controllers\InventoryController::class, 'analytics']);
    Route::get('/inventory/usage-trends', [App\Http\Controllers\InventoryController::class, 'usageTrends']);
    Route::apiResource('inventory', App\Http\Controllers\InventoryController::class);

    // Orders
    Route::get('/orders/analytics', [App\Http\Controllers\OrderController::class, 'analytics']);
    Route::apiResource('orders', App\Http\Controllers\OrderController::class);
    Route::get('/orders/pending', [App\Http\Controllers\OrderController::class, 'pending']);
    Route::put('/orders/{id}/approve', [App\Http\Controllers\OrderController::class, 'approve']);

    // Suppliers
    Route::apiResource('suppliers', App\Http\Controllers\SupplierController::class);
    Route::get('/suppliers/active', [App\Http\Controllers\SupplierController::class, 'active']);
    Route::get('/suppliers/category/{category}', [App\Http\Controllers\SupplierController::class, 'byCategory']);

    // Prescriptions
    Route::apiResource('prescriptions', App\Http\Controllers\PrescriptionController::class);
    Route::post('/prescriptions/{id}/refill', [App\Http\Controllers\PrescriptionController::class, 'requestRefill']);

    // Analytics
    Route::get('/analytics/summary', [App\Http\Controllers\AnalyticsController::class, 'summary']);
    Route::get('/analytics/patients', [App\Http\Controllers\AnalyticsController::class, 'patients']);
    Route::get('/analytics/visits', [App\Http\Controllers\AnalyticsController::class, 'visits']);
    Route::get('/analytics/doctors', [App\Http\Controllers\AnalyticsController::class, 'doctors']);
    Route::get('/analytics/revenue', [App\Http\Controllers\AnalyticsController::class, 'revenue']);
    Route::get('/analytics/todays-appointments', [App\Http\Controllers\AnalyticsController::class, 'todaysAppointments']);
    Route::get('/analytics/check-ins-by-hour', [App\Http\Controllers\AnalyticsController::class, 'checkInsByHour']);
    Route::get('/analytics/doctors/{doctorId}/summary', [App\Http\Controllers\AnalyticsController::class, 'doctorSummary']);

    // Settings
    Route::get('/settings', [App\Http\Controllers\SettingsController::class, 'index']);
    Route::put('/settings', [App\Http\Controllers\SettingsController::class, 'update']);

    // Audit Logs
    Route::get('/audit-logs', [App\Http\Controllers\AuditLogController::class, 'index']);

    // Roles
    Route::apiResource('roles', App\Http\Controllers\RoleController::class);
    Route::post('/roles/{id}/permissions', [App\Http\Controllers\RoleController::class, 'assignPermissions']);

    // Permissions
    Route::apiResource('permissions', App\Http\Controllers\PermissionController::class);
    Route::post('/permissions/{id}/assign-to-roles', [App\Http\Controllers\PermissionController::class, 'assignToRoles']);
    Route::post('/permissions/{id}/assign-to-users', [App\Http\Controllers\PermissionController::class, 'assignToUsers']);

    // Correction Requests
    Route::get('/correction-requests', [App\Http\Controllers\CorrectionRequestController::class, 'index']); // patient
    Route::post('/correction-requests', [App\Http\Controllers\CorrectionRequestController::class, 'store']); // patient
    Route::delete('/correction-requests/{id}', [App\Http\Controllers\CorrectionRequestController::class, 'destroy']); // patient
    Route::put('/correction-requests/{id}', [App\Http\Controllers\CorrectionRequestController::class, 'update']); // admin
    Route::get('/admin/correction-requests', [App\Http\Controllers\CorrectionRequestController::class, 'adminIndex']); // admin

    // Personal Notes
    Route::get('/personal-notes', [App\Http\Controllers\PersonalNoteController::class, 'index']); // patient
    Route::post('/personal-notes', [App\Http\Controllers\PersonalNoteController::class, 'store']); // patient
    Route::put('/personal-notes/{id}', [App\Http\Controllers\PersonalNoteController::class, 'update']); // patient
    Route::delete('/personal-notes/{id}', [App\Http\Controllers\PersonalNoteController::class, 'destroy']); // patient

    // Uploaded Documents
    Route::get('/uploaded-documents', [App\Http\Controllers\UploadedDocumentController::class, 'index']); // patient
    Route::post('/uploaded-documents', [App\Http\Controllers\UploadedDocumentController::class, 'store']); // patient
    Route::delete('/uploaded-documents/{id}', [App\Http\Controllers\UploadedDocumentController::class, 'destroy']); // patient
    Route::get('/admin/uploaded-documents', [App\Http\Controllers\UploadedDocumentController::class, 'adminIndex']); // admin
});
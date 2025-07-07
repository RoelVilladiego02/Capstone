import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import Inventory from './pages/Inventory';
import Billing from './pages/Billing';
import Prescriptions from './pages/Prescriptions';
import Analytics from './pages/Analytics';
import DoctorSchedule from './pages/DoctorSchedule';
import UserProfile from './pages/UserProfile';
import Users from './pages/Users';
import Doctors from './pages/Doctors';
import Settings from './pages/Settings';
import Orders from './pages/Orders';
import Suppliers from './pages/Suppliers';
import BillingHistory from './pages/BillingHistory';
import RevenueAnalysis from './pages/analytics/RevenueAnalysis';
import MedicalRecordView from './components/medical-records/MedicalRecordView';
import RoleManagement from './pages/users/RoleManagement';
import Permissions from './pages/users/Permissions';
import PatientAccounts from './pages/users/PatientAccounts';
import DoctorAccounts from './pages/users/DoctorAccounts';
import StaffAccounts from './pages/users/StaffAccounts';
import DoctorsSchedules from './pages/DoctorsSchedules';
import GeneralSettings from './pages/settings/GeneralSettings';
import AuditLogs from './pages/settings/AuditLogs';
import SecuritySettings from './pages/settings/SecuritySettings';
import AllMedicalRecords from './pages/doctor/AllMedicalRecords';
import AllPrescriptions from './pages/doctor/AllPrescriptions';
import DiagnosticResults from './pages/doctor/DiagnosticResults';
import AdminDashboard from './pages/admin/AdminDashboard';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import ReceptionistDashboard from './pages/receptionist/ReceptionistDashboard';
import InventoryManagerDashboard from './pages/inventory/InventoryManagerDashboard';
import PatientDashboard from './pages/patient/PatientDashboard';
import GeneralInventoryReports from './pages/GeneralInventoryReports';

function App() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/" replace />} />
        <Route path="/register" element={!currentUser ? <Register /> : <Navigate to="/" replace />} />

        <Route element={<Layout />}>
          {/* Main Dashboard (Patient default) */}
          <Route path="/" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/dashboard" element={
            <PrivateRoute roles={['Patient']}>
              <PatientDashboard />
            </PrivateRoute>
          } />
          <Route path="/admin/dashboard" element={
            <PrivateRoute roles={['Admin']}>
              <AdminDashboard />
            </PrivateRoute>
          } />
          <Route path="/doctor/dashboard" element={
            <PrivateRoute roles={['Doctor']}>
              <DoctorDashboard />
            </PrivateRoute>
          } />
          <Route path="/receptionist/dashboard" element={
            <PrivateRoute roles={['Receptionist']}>
              <ReceptionistDashboard />
            </PrivateRoute>
          } />
          <Route path="/inventory/dashboard" element={
            <PrivateRoute roles={['InventoryManager']}>
              <InventoryManagerDashboard />
            </PrivateRoute>
          } />

          {/* Patient Routes */}
          <Route path="/appointments/*" element={
            <PrivateRoute roles={['Admin', 'Doctor', 'Receptionist', 'Patient']}>
              <Appointments />
            </PrivateRoute>
          } />

          {/* Update Medical Records Route */}
          <Route path="/medical-records" element={
            <PrivateRoute roles={['Admin', 'Doctor', 'Patient']}>
              <MedicalRecordView />
            </PrivateRoute>
          } />

          <Route path="/medical-records/all" element={
            <PrivateRoute roles={['Doctor']}>
              <AllMedicalRecords />
            </PrivateRoute>
          } />

          <Route path="/prescriptions/*" element={
            <PrivateRoute roles={['Admin', 'Doctor', 'Patient']}>
              <Prescriptions />
            </PrivateRoute>
          } />

          <Route path="/prescriptions/all" element={
            <PrivateRoute roles={['Doctor']}>
              <AllPrescriptions />
            </PrivateRoute>
          } />

          <Route path="/billing-history/*" element={
            <PrivateRoute roles={['Patient']}>
              <BillingHistory />
            </PrivateRoute>
          } />

          {/* Doctor Routes */}
          <Route path="/patients/*" element={
            <PrivateRoute roles={['Admin', 'Doctor', 'Receptionist']}>
              <Patients />
            </PrivateRoute>
          } />

          <Route path="/doctors/schedule" element={
            <PrivateRoute roles={['Admin', 'Doctor']}>
              <DoctorSchedule />
            </PrivateRoute>
          } />

          {/* Admin Routes */}
          <Route path="/users/*" element={
            <PrivateRoute roles={['Admin']}>
              <Users />
            </PrivateRoute>
          } />

          <Route path="/doctors/*" element={
            <PrivateRoute roles={['Admin']}>
              <Doctors />
            </PrivateRoute>
          } />

          <Route path="/inventory/*" element={
            <PrivateRoute roles={['Admin', 'InventoryManager']}>
              <Inventory />
            </PrivateRoute>
          } />

          <Route path="/billing/*" element={
            <PrivateRoute roles={['Admin', 'Receptionist']}>
              <Billing />
            </PrivateRoute>
          } />

          {/* Analytics Routes */}
          <Route path="/analytics/summary" element={
            <PrivateRoute roles={['Admin']}>
              <Analytics activeTab="summary" />
            </PrivateRoute>
          } />
          
          <Route path="/analytics/patients" element={
            <PrivateRoute roles={['Admin']}>
              <Analytics activeTab="patients" />
            </PrivateRoute>
          } />

          <Route path="/analytics/visits" element={
            <PrivateRoute roles={['Admin']}>
              <Analytics activeTab="visits" />
            </PrivateRoute>
          } />

          <Route path="/analytics/doctors" element={
            <PrivateRoute roles={['Admin']}>
              <Analytics activeTab="doctors" />
            </PrivateRoute>
          } />

          <Route path="/analytics/revenue" element={
            <PrivateRoute roles={['Admin']}>
              <RevenueAnalysis />
            </PrivateRoute>
          } />

          <Route path="/settings" element={
            <PrivateRoute roles={['Admin']}>
              <Settings />
            </PrivateRoute>
          }>
            <Route path="" element={<Navigate to="general" replace />} />
            <Route path="general" element={<GeneralSettings />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="security" element={<SecuritySettings />} />
          </Route>

          {/* Inventory Manager Routes */}
          <Route path="/orders/*" element={
            <PrivateRoute roles={['InventoryManager']}>
              <Orders />
            </PrivateRoute>
          } />

          <Route path="/suppliers/*" element={
            <PrivateRoute roles={['InventoryManager']}>
              <Suppliers />
            </PrivateRoute>
          } />

          {/* Common Routes */}
          <Route path="/profile" element={
            <PrivateRoute>
              <UserProfile />
            </PrivateRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />

          {/* User Management Routes */}
          <Route path="/users/patients" element={
            <PrivateRoute roles={['Admin']}>
              <PatientAccounts />
            </PrivateRoute>
          } />
          
          <Route path="/users/doctors" element={
            <PrivateRoute roles={['Admin']}>
              <DoctorAccounts />
            </PrivateRoute>
          } />

          <Route path="/users/staff" element={
            <PrivateRoute roles={['Admin']}>
              <StaffAccounts />
            </PrivateRoute>
          } />

          <Route path="/users/roles" element={
            <PrivateRoute roles={['Admin']}>
              <RoleManagement />
            </PrivateRoute>
          } />
          
          <Route path="/users/permissions" element={
            <PrivateRoute roles={['Admin']}>
              <Permissions />
            </PrivateRoute>
          } />

          <Route path="/medical-records/:patientId?" element={
            <PrivateRoute roles={['Admin', 'Doctor', 'Patient']}>
              <MedicalRecordView />
            </PrivateRoute>
          } />

          {/* Stock Reports Route */}
          <Route path="/stockreports" element={
            <PrivateRoute roles={['Admin', 'InventoryManager']}>
              <GeneralInventoryReports />
            </PrivateRoute>
          } />

          {/* Doctor Schedules Route for Receptionist */}
          <Route path="/doctor-schedules" element={
            <PrivateRoute roles={['Admin', 'Receptionist']}>
              <DoctorsSchedules />
            </PrivateRoute>
          } />

          <Route path="/diagnostic-results" element={
            <PrivateRoute roles={['Doctor']}>
              <DiagnosticResults />
            </PrivateRoute>
          } />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;

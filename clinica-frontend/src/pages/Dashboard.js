import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminDashboard from './admin/AdminDashboard';
import DoctorDashboard from './doctor/DoctorDashboard';
import ReceptionistDashboard from './receptionist/ReceptionistDashboard';
import InventoryManagerDashboard from './inventory/InventoryManagerDashboard';
import PatientDashboard from './patient/PatientDashboard';

const Dashboard = () => {
  const { currentUser } = useAuth();

  // Get the first role, fallback to empty string if not present
  const userRole = Array.isArray(currentUser.roles) ? currentUser.roles[0] : currentUser.role || '';

  const getWelcomeMessage = (role) => {
    switch(role) {
      case 'Admin':
        return '';
      case 'Doctor':
        return '';
      case 'Receptionist':
        return '';
      case 'InventoryManager':
        return '';
      case 'Patient':
        return '';
      default:
        return 'Welcome';
    }
  };

  const getDashboardByRole = () => {
    // Ensure userRole is a string before calling replace
    const normalizedRole = (userRole || '').replace(/\s+/g, '');
    switch(normalizedRole) {
      case 'Admin':
        return <AdminDashboard />;
      case 'Doctor':
        return <DoctorDashboard />;
      case 'Receptionist':
        return <ReceptionistDashboard />;
      case 'InventoryManager':
        return <InventoryManagerDashboard />;
      case 'Patient':
        return <PatientDashboard />;
      default:
        return <div>Access Denied</div>;
    }
  };

  return (
    <div className="container-fluid">
      <h1>{getWelcomeMessage(userRole)}</h1>
      {getDashboardByRole()}
    </div>
  );
};

export default Dashboard;

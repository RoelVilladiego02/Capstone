import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminDashboard from './admin/AdminDashboard';
import DoctorDashboard from './doctor/DoctorDashboard';
import ReceptionistDashboard from './receptionist/ReceptionistDashboard';
import InventoryManagerDashboard from './inventory/InventoryManagerDashboard';
import PatientDashboard from './patient/PatientDashboard';

const Dashboard = () => {
  const { currentUser } = useAuth();

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
    // Normalize role to remove spaces for matching
    const normalizedRole = currentUser.role.replace(/\s+/g, '');
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
      <h1>{getWelcomeMessage(currentUser.role)}</h1>
      {getDashboardByRole()}
    </div>
  );
};

export default Dashboard;

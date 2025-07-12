import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MyAppointments from '../components/appointments/MyAppointments';
import AppointmentForm from '../components/appointments/AppointmentForm';
import AppointmentList from '../components/appointments/AppointmentList';

const Appointments = () => {
  return (
    <Routes>
      <Route path="/" element={<MyAppointments />} />
      <Route path="/new" element={<AppointmentForm />} />
      <Route path="/list" element={<AppointmentList />} />
    </Routes>
  );
};

export default Appointments;
 
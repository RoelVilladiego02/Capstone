import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppointmentCalendar from '../components/appointments/AppointmentCalendar';
import AppointmentForm from '../components/appointments/AppointmentForm';
import AppointmentList from '../components/appointments/AppointmentList';

const Appointments = () => {
  return (
    <Routes>
      <Route path="/" element={<AppointmentCalendar />} />
      <Route path="/new" element={<AppointmentForm />} />
      <Route path="/list" element={<AppointmentList />} />
    </Routes>
  );
};

export default Appointments;
 
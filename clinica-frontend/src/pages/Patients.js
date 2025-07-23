import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PatientsList from '../components/patients/PatientsList';
import PatientRegistration from '../components/patients/PatientRegistration';
import PatientDetails from '../components/patients/PatientDetails';
import MedicalRecordView from '../components/medical-records/MedicalRecordView';

const Patients = () => {
  return (
    <Routes>
      <Route path="/" element={<PatientsList />} />
      <Route path="/register" element={<PatientRegistration />} />
      <Route path="/:id" element={<PatientDetails />} />
      <Route path="/:id/records" element={<MedicalRecordView />} />
    </Routes>
  );
};

export default Patients;

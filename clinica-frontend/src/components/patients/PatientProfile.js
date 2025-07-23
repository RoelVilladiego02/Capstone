import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { patientService } from '../../services/patientService';
import { extractPatientId } from '../../utils/patientUtils';
import MedicalRecord from '../medical-records/MedicalRecordView';

const PatientProfile = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        const patientData = await patientService.getPatient(id);
        
        const transformedData = {
          id: extractPatientId(patientData),
          fullName: patientData.user?.name || 'N/A',
          dob: patientData.dob,
          gender: patientData.gender,
          contactNumber: patientData.phone,
          email: patientData.user?.email,
          address: patientData.address,
          emergencyContact: patientData.emergency_contact || 'Not provided'
        };
        
        setPatient(transformedData);
      } catch (err) {
        console.error('Error fetching patient data:', err);
        setError('Failed to load patient information');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPatientData();
    }
  }, [id]);

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    return Math.floor((new Date() - new Date(dob)) / (365.25 * 24 * 60 * 60 * 1000));
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-4" role="alert">
        {error}
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="alert alert-warning m-4" role="alert">
        Patient not found
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <div className="row">
        <div className="col-md-4">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="text-center mb-4">
                <div className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center" 
                     style={{ width: '100px', height: '100px', fontSize: '2.5rem' }}>
                  {patient.fullName.charAt(0)}
                </div>
                <h4 className="mt-3 mb-0">{patient.fullName}</h4>
                <span className="text-muted">Patient ID: {patient.id}</span>
              </div>

              <hr />

              <div className="patient-info">
                <p><strong>Age:</strong> {calculateAge(patient.dob)}</p>
                <p><strong>Gender:</strong> {patient.gender}</p>
                <p><strong>Contact:</strong> {patient.contactNumber}</p>
                <p><strong>Email:</strong> {patient.email}</p>
                <p><strong>Address:</strong> {patient.address}</p>
              </div>

              <hr />

              <div className="emergency-contact">
                <h6 className="fw-bold">Emergency Contact</h6>
                <p className="mb-1">{patient.emergencyContact.name || 'N/A'}</p>
                <p className="mb-1">{patient.emergencyContact.relation || 'N/A'}</p>
                <p>{patient.emergencyContact.phone || 'N/A'}</p>
              </div>

              <div className="d-grid gap-2 mt-4">
                <Link to={`/appointments/new?patientId=${patient.id}`} className="btn btn-primary">
                  Schedule Appointment
                </Link>
                <button className="btn btn-outline-primary">
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <MedicalRecord patientId={patient.id} />
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;


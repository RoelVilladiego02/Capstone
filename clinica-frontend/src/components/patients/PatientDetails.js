import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientService } from '../../services/patientService';

const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        setLoading(true);
        const data = await patientService.getPatient(id);
        setPatient(data);
      } catch (err) {
        console.error('Error fetching patient details:', err);
        setError(err.message || 'Failed to load patient details');
      } finally {
        setLoading(false);
      }
    };

    fetchPatientDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-4" role="alert">
        <h4 className="alert-heading">Error Loading Patient Details</h4>
        <p>{error}</p>
        <hr />
        <button 
          className="btn btn-outline-danger"
          onClick={() => navigate('/patients')}
        >
          Back to Patient List
        </button>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="alert alert-warning m-4" role="alert">
        <h4 className="alert-heading">Patient Not Found</h4>
        <p>The requested patient information could not be found.</p>
        <hr />
        <button 
          className="btn btn-outline-warning"
          onClick={() => navigate('/patients')}
        >
          Back to Patient List
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Patient Details</h4>
          <p className="text-muted mb-0">View and manage patient information</p>
        </div>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-secondary"
            onClick={() => navigate('/patients')}
          >
            <i className="bi bi-arrow-left me-2"></i>Back to List
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => navigate(`/appointments/new?patientId=${patient.id}`)}
          >
            <i className="bi bi-calendar-plus me-2"></i>Schedule Appointment
          </button>
        </div>
      </div>

      <div className="row g-4">
        {/* Patient Summary Card */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="text-center mb-4">
                <div 
                  className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: '100px', height: '100px', fontSize: '2.5rem' }}
                >
                  {patient.user?.name?.charAt(0) || 'P'}
                </div>
                <h5 className="mb-1">{patient.user?.name}</h5>
                <p className="text-muted mb-0">Patient ID: {patient.id}</p>
              </div>

              <hr />

              <div className="mb-4">
                <h6 className="text-uppercase text-muted mb-3 small">Contact Information</h6>
                <div className="mb-3">
                  <label className="text-muted small d-block">Phone Number</label>
                  <div className="fw-medium">{patient.phone || 'Not provided'}</div>
                </div>
                <div className="mb-3">
                  <label className="text-muted small d-block">Email</label>
                  <div className="fw-medium">{patient.user?.email || 'Not provided'}</div>
                </div>
                <div className="mb-3">
                  <label className="text-muted small d-block">Address</label>
                  <div className="fw-medium">{patient.address || 'Not provided'}</div>
                </div>
              </div>

              <div className="mb-4">
                <h6 className="text-uppercase text-muted mb-3 small">Personal Information</h6>
                <div className="mb-3">
                  <label className="text-muted small d-block">Date of Birth</label>
                  <div className="fw-medium">
                    {patient.dob ? new Date(patient.dob).toLocaleDateString() : 'Not provided'}
                  </div>
                </div>
                <div className="mb-3">
                  <label className="text-muted small d-block">Gender</label>
                  <div className="fw-medium">{patient.gender || 'Not specified'}</div>
                </div>
              </div>

              <div>
                <h6 className="text-uppercase text-muted mb-3 small">Emergency Contact</h6>
                <div className="mb-3">
                  <div className="fw-medium">
                    {patient.emergency_contact || 'No emergency contact provided'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="col-md-8">
          {/* Navigation Tabs */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <i className="bi bi-person me-2"></i>Medical History
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'appointments' ? 'active' : ''}`}
                onClick={() => setActiveTab('appointments')}
              >
                <i className="bi bi-calendar-check me-2"></i>Appointments
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'prescriptions' ? 'active' : ''}`}
                onClick={() => setActiveTab('prescriptions')}
              >
                <i className="bi bi-prescription me-2"></i>Prescriptions
              </button>
            </li>
          </ul>

          {/* Tab Content */}
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              {activeTab === 'profile' && (
                <div>
                  <h5 className="card-title mb-4">Medical History</h5>
                  {/* Add medical history content here */}
                  <p className="text-muted">Medical history information will be displayed here.</p>
                </div>
              )}

              {activeTab === 'appointments' && (
                <div>
                  <h5 className="card-title mb-4">Appointments</h5>
                  {/* Add appointments content here */}
                  <p className="text-muted">Appointment history will be displayed here.</p>
                </div>
              )}

              {activeTab === 'prescriptions' && (
                <div>
                  <h5 className="card-title mb-4">Prescriptions</h5>
                  {/* Add prescriptions content here */}
                  <p className="text-muted">Prescription history will be displayed here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;

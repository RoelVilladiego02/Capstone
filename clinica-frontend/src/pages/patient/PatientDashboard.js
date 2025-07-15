import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AppointmentForm from '../../components/appointments/AppointmentForm';
import { appointmentService } from '../../services/appointmentService';
import { patientService } from '../../services/patientService';
import { prescriptionService } from '../../services/prescriptionService';
import { extractPatientId, normalizeAppointment, normalizeTime } from '../../utils/patientUtils';

function combineDateAndTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date)) return null;
  const [hours, minutes] = timeStr.split(':').map(Number);
  date.setUTCHours(hours, minutes, 0, 0);
  return date;
}

const PatientDashboard = () => {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentPrescriptions, setRecentPrescriptions] = useState([]);
  const [error, setError] = useState('');
  const [patientId, setPatientId] = useState(null);
  const [patientName, setPatientName] = useState('');

  // Use your actual auth token and user id logic
  const token = localStorage.getItem('authToken');

  // Fetch patient id from /patients/me on mount
  useEffect(() => {
    const fetchPatientId = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        const data = await patientService.getMyProfile();
        // Extract patient name from user object if available
        const name = data.user?.name || data.patient?.name || '';
        setPatientName(name);
        const id = extractPatientId(data);
        console.log('Extracted patient ID:', id); // Debug log
        
        if (!id) {
          setError('Unable to retrieve patient profile. Please contact support.');
          return;
        }
        
        setPatientId(id);
      } catch (err) {
        console.error('Error fetching patient id:', err);
        setError('Failed to load patient profile. Please try again.');
      }
    };
    fetchPatientId();
  }, []);

  // Fetch appointments when patientId is available
  const fetchAppointments = useCallback(async () => {
    if (!patientId) {
      console.log('No patientId available for fetching appointments');
      return;
    }
    
    console.log('Fetching appointments for patient ID:', patientId); // Debug log
    
    try {
      const data = await appointmentService.getAppointments({ patient_id: patientId });
      console.log('Raw appointments data from API:', data); // Debug log
      
      if (!Array.isArray(data)) {
        console.error('Appointments data is not an array:', data);
        setError('Invalid data format received from server');
        return;
      }
      
      // Normalize all appointments for consistent data structure
      const normalizedAppointments = data.map(apt => {
        console.log('Normalizing appointment:', apt);
        return normalizeAppointment(apt, patientId);
      });
      
      console.log('Normalized appointments:', normalizedAppointments);
      
      // Sort appointments by date and time
      const sortedAppointments = normalizedAppointments.sort((a, b) => {
        const dateA = combineDateAndTime(a.date, a.time);
        const dateB = combineDateAndTime(b.date, b.time);
        return dateA - dateB;
      });

      // Separate teleconsultations and regular appointments
      const allUpcoming = sortedAppointments.filter(a => a.status !== 'Completed' && a.status !== 'Cancelled');
      setUpcomingAppointments(allUpcoming);
      setError('');
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  // Use fetchAppointments in useEffect
  useEffect(() => {
    if (!patientId) return;
    setLoading(true);
    
    // Fetch all data in parallel
    Promise.all([
      fetchAppointments(),
      prescriptionService.getByPatient(patientId),
      // Add other parallel fetches here if needed
    ])
      .then(([_, prescriptions]) => {
        setRecentPrescriptions(prescriptions);
        setError('');
      })
      .catch(err => {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load some dashboard data. Please refresh.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token, patientId, fetchAppointments]);

  // Handle successful booking - IMPROVED for better immediate state updates
  const handleBookingSuccess = useCallback(async (newAppointment) => {
    console.log('Booking successful, new appointment:', newAppointment); // Debug log
    
    setShowBookingModal(false);
    
    // Create normalized appointment object with consistent structure
    const appointmentWithDetails = normalizeAppointment(newAppointment, patientId);
    
    // Immediately update the appointments lists based on type
    const updatedAppointments = [...upcomingAppointments, appointmentWithDetails].sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return dateA - dateB;
    });
    setUpcomingAppointments(updatedAppointments);
    
    // Then refresh to ensure consistency with backend
    setTimeout(() => {
      fetchAppointments();
    }, 1000); // Small delay to ensure backend has processed the new appointment
  }, [fetchAppointments, patientId, upcomingAppointments]);

  const handleBookAppointment = async () => {
    if (!patientId) {
      setError('Patient profile not available. Please refresh the page.');
      return;
    }
    setError('');
    setShowBookingModal(true);
  };

  // Helper to filter prescriptions from the last 2 days
  const getRecentPrescriptions = () => {
    const now = new Date();
    return recentPrescriptions.filter(prescription => {
      const prescDate = new Date(prescription.date);
      // Difference in ms
      const diffMs = now - prescDate;
      // 2 days in ms = 2 * 24 * 60 * 60 * 1000
      return diffMs >= 0 && diffMs <= 2 * 24 * 60 * 60 * 1000;
    });
  };

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center min-vh-100">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-primary">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 bg-light">
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
          <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={() => setError('')}></button>
        </div>
      )}
      
      <div className="row g-4">
        {/* Welcome Banner */}
        <div className="col-12">
          <div className="card border-0 bg-primary text-white shadow rounded-lg">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="fw-bold mb-1">
                    <i className="bi bi-person-circle me-2"></i>
                    Welcome Back{patientName ? `, ${patientName}` : ''}!
                  </h2>
                  <p className="mb-0">Your health dashboard is updated and ready for you.</p>
                </div>
                <div className="d-none d-md-block">
                  <i className="bi bi-heart-pulse fs-1"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Unified Upcoming Appointments Card */}
        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm rounded-lg h-100">
            <div className="card-header bg-white border-0 pt-4 pb-0">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="card-title fw-bold mb-0">
                  <i className="bi bi-calendar-check me-2 text-primary"></i>
                  Upcoming Appointments
                </h5>
                <button
                  className="btn btn-outline-primary btn-sm rounded-pill px-3"
                  onClick={handleBookAppointment}
                >
                  <i className="bi bi-plus-circle me-1"></i> New
                </button>
              </div>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="d-flex justify-content-center align-items-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : error && error.includes('Only one appointment per day is allowed') ? null : (
                upcomingAppointments.length > 0 ? (
                  <div className="row">
                    {upcomingAppointments.map((apt) => (
                      <div key={apt.id} className="col-12 mb-3">
                        <div className="p-3 border-0 shadow-sm rounded-lg bg-white d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center">
                            <div className={`rounded-circle p-3 me-3 ${apt.type === 'Teleconsultation' ? 'bg-info' : 'bg-primary'} bg-opacity-10`}>
                              <i className={`bi ${apt.type === 'Teleconsultation' ? 'bi-camera-video' : 'bi-stethoscope'} ${apt.type === 'Teleconsultation' ? 'text-info' : 'text-primary'}`} style={{ fontSize: '1.5rem' }}></i>
                            </div>
                            <div>
                              <h6 className="mb-1 fw-bold">{apt.type}</h6>
                              <p className="mb-0 text-muted small">
                                {apt.doctor || 'Doctor TBD'}
                              </p>
                              <div className="d-flex align-items-center mt-1">
                                <i className="bi bi-calendar-event text-muted me-2"></i>
                                <span className="fw-medium me-3">
                                  {new Date(apt.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </span>
                                <i className="bi bi-clock text-muted me-2"></i>
                                <span className="fw-medium">{normalizeTime(apt.time)}</span>
                              </div>
                              {apt.concern && (
                                <div className="mt-1">
                                  <small className="text-muted d-block mb-1">Concern</small>
                                  <span className="text-secondary small">{apt.concern}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <span className={`badge rounded-pill bg-${
                            apt.status === 'Scheduled' ? 'primary' :
                            apt.status === 'Confirmed' ? 'success' :
                            apt.status === 'Checked In' ? 'info' :
                            apt.status === 'Cancelled' ? 'danger' :
                            apt.status === 'No Show' ? 'warning' :
                            'secondary'
                          } fw-semibold px-3 py-2`}>
                            {apt.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted py-4">
                    <i className="bi bi-calendar fs-1"></i>
                    <p className="mt-2">No upcoming appointments</p>
                    <button className="btn btn-outline-primary rounded-pill" onClick={handleBookAppointment}>
                      Schedule Your First Appointment
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Recent Prescriptions Card */}
        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm rounded-lg h-100">
            <div className="card-header bg-white border-0 pt-4 pb-0">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="card-title fw-bold mb-0">
                  <i className="bi bi-capsule me-2 text-info"></i>
                  Recent Prescriptions
                </h5>
                <Link to="/prescriptions" className="btn btn-outline-primary btn-sm rounded-pill px-3">
                  View All
                </Link>
              </div>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="d-flex justify-content-center align-items-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : error && error.includes('Only one appointment per day is allowed') ? null : (
                recentPrescriptions.length > 0 ? (
                  getRecentPrescriptions().map(prescription => (
                    <div key={prescription.id} className="mb-3 p-3 border-0 shadow-sm rounded-lg bg-white">
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                          <i className="bi bi-capsule text-info"></i>
                        </div>
                        <div>
                          {Array.isArray(prescription.medications) && prescription.medications.length > 0 ? (
                            <>
                              <h6 className="fw-bold mb-1">{prescription.medications[0].name}</h6>
                              <p className="mb-0 small text-secondary">
                                {prescription.medications[0].dosage} · Prescribed on {new Date(prescription.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                              </p>
                            </>
                          ) : (
                            <>
                              <h6 className="fw-bold mb-1">No medication info</h6>
                              <p className="mb-0 small text-secondary">Prescribed on {prescription.date}</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted py-4">
                    <i className="bi bi-file-earmark-medical fs-1"></i>
                    <p className="mt-2">No recent prescriptions</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="col-12 col-sm-4">
          <div className="card border-0 shadow-sm rounded-lg h-100">
            <div className="card-header bg-white border-0 pt-4 pb-0">
              <h5 className="card-title fw-bold mb-0">
                <i className="bi bi-lightning-charge me-2 text-warning"></i>
                Quick Actions
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <Link to="/medical-records" className="card border-0 shadow-sm h-100 text-decoration-none quick-action-card">
                    <div className="card-body text-center py-4">
                      <div className="rounded-circle bg-primary bg-opacity-10 p-3 mx-auto mb-3" style={{ width: 'fit-content' }}>
                        <i className="bi bi-file-medical quick-action-icon fs-4 text-primary"></i>
                      </div>
                      <h6 className="mb-0 text-primary">Medical Records</h6>
                    </div>
                  </Link>
                </div>
                <div className="col-md-4">
                  <Link to="/profile" className="card border-0 shadow-sm h-100 text-decoration-none quick-action-card">
                    <div className="card-body text-center py-4">
                      <div className="rounded-circle bg-success bg-opacity-10 p-3 mx-auto mb-3" style={{ width: 'fit-content' }}>
                        <i className="bi bi-person quick-action-icon fs-4 text-success"></i>
                      </div>
                      <h6 className="mb-0 text-success">Update Profile</h6>
                    </div>
                  </Link>
                </div>
                <div className="col-md-4">
                  <Link to="/billing-history" className="card border-0 shadow-sm h-100 text-decoration-none quick-action-card">
                    <div className="card-body text-center py-4">
                      <div className="rounded-circle bg-warning bg-opacity-10 p-3 mx-auto mb-3" style={{ width: 'fit-content' }}>
                        <i className="bi bi-receipt quick-action-icon fs-4 text-warning"></i>
                      </div>
                      <h6 className="mb-0 text-warning">View Bills</h6>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Form Modal */}
      <AppointmentForm 
        isOpen={showBookingModal}
        onSuccess={handleBookingSuccess}
        onCancel={() => setShowBookingModal(false)}
      />
    </div>
  );
};

export default PatientDashboard;

// Add custom styles for Quick Actions hover and card backgrounds
<style>
{`
  .quick-action-card:hover {
    box-shadow: 0 0 0.5rem #e3193733;
    transform: translateY(-2px) scale(1.03);
    transition: all 0.2s;
    cursor: pointer;
  }
  .quick-action-icon {
    font-size: 2.5rem;
    transition: color 0.2s, transform 0.2s;
  }
  .quick-action-card:hover .quick-action-icon {
    color: #e31937 !important;
    transform: scale(1.15);
  }
  .dashboard-card {
    background: #f8f9fa;
    border-radius: 1rem;
    box-shadow: 0 2px 12px #0000000d;
  }
  @media (max-width: 576px) {
    .dashboard-card {
      padding: 0.5rem !important;
      border-radius: 0.5rem !important;
    }
    .quick-action-icon {
      font-size: 2rem !important;
    }
    .card-title {
      font-size: 1.1rem !important;
    }
    .fw-bold.mb-1 {
      font-size: 1.2rem !important;
    }
    .card-body {
      padding: 1rem !important;
    }
  }
`}
</style>
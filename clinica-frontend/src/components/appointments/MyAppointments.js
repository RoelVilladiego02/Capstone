import React, { useState, useEffect, useCallback } from 'react';
import AppointmentForm from './AppointmentForm';
import { appointmentService } from '../../services/appointmentService';
import { patientService } from '../../services/patientService';
import { extractPatientId, normalizeAppointment, normalizeTime } from '../../utils/patientUtils';

function combineDateAndTime(dateStr, timeStr) {
  // Handles ISO date string and HH:mm time string
  if (!dateStr || !timeStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date)) return null;
  const [hours, minutes] = timeStr.split(':').map(Number);
  date.setUTCHours(hours, minutes, 0, 0);
  return date;
}

const MyAppointments = () => {
  const [currentView, setCurrentView] = useState('upcoming'); // 'upcoming', 'calendar', 'past'
  const [appointments, setAppointments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [patientId, setPatientId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch patient id from /patients/me on mount
  useEffect(() => {
    const fetchPatientId = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        const data = await patientService.getMyProfile();
        console.log('Patient profile data:', data);
        
        const id = extractPatientId(data);
        console.log('Extracted patient ID:', id);
        
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

  // Fetch all appointments for the patient
  const fetchAppointments = useCallback(async () => {
    if (!patientId) {
      console.log('No patientId available for fetching appointments');
      return;
    }
    
    setLoading(true);
    try {
      console.log('Fetching appointments for patient ID:', patientId);
      const data = await appointmentService.getAppointments({ patient_id: patientId });
      console.log('Raw appointments data from API:', data);
      
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
      setAppointments(normalizedAppointments);
      setError('');
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    if (!patientId) return;
    fetchAppointments();
  }, [fetchAppointments, patientId]);

  // Categorize appointments
  const upcomingAppointments = appointments.filter(apt =>
    apt.status !== 'Completed' && apt.status !== 'Cancelled'
  ).sort((a, b) => {
    const dateA = combineDateAndTime(a.date, a.time);
    const dateB = combineDateAndTime(b.date, b.time);
    return dateA - dateB;
  });

  const pastAppointments = appointments.filter(apt =>
    apt.status === 'Completed' || apt.status === 'Cancelled'
  ).sort((a, b) => {
    const dateA = combineDateAndTime(a.date, a.time);
    const dateB = combineDateAndTime(b.date, b.time);
    return dateB - dateA;
  });

  console.log('Final categorized appointments:', {
    upcoming: upcomingAppointments.length,
    past: pastAppointments.length,
    upcomingAppointments,
    pastAppointments
  });

  const handleBookingSuccess = useCallback(async (newAppointment) => {
    console.log('Booking successful, new appointment:', newAppointment);
    
    setShowForm(false);
    setError('');
    
    const message = `Appointment successfully booked for ${newAppointment.date} at ${normalizeTime(newAppointment.time)}!`;
    setSuccessMessage(message);
    
    setTimeout(() => setSuccessMessage(''), 5000);
    
    // Refresh appointments
    setTimeout(() => {
      fetchAppointments();
    }, 1000);
  }, [fetchAppointments]);

  const handleBookNewAppointment = async () => {
    if (!patientId) {
      setError('Patient profile not available. Please refresh the page.');
      return;
    }

    setError('');
    setSuccessMessage('');

    setShowForm(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending': { color: 'warning text-dark', icon: 'bi-hourglass-split' },
      'Scheduled': { color: 'primary', icon: 'bi-calendar-check' },
      'Confirmed': { color: 'success', icon: 'bi-check-circle' },
      'Checked In': { color: 'info', icon: 'bi-person-check' },
      'Completed': { color: 'secondary', icon: 'bi-check2-all' },
      'Cancelled': { color: 'danger', icon: 'bi-x-circle' },
      'No Show': { color: 'warning', icon: 'bi-exclamation-triangle' }
    };

    const config = statusConfig[status] || { color: 'secondary', icon: 'bi-question-circle' };

    return (
      <span className={`badge bg-${config.color} rounded-pill`}>
        <i className={`bi ${config.icon} me-1`}></i>
        {status}
      </span>
    );
  };

  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleAppointment, setRescheduleAppointment] = useState(null);

  const handleReschedule = (appointment) => {
    console.log('Reschedule clicked:', appointment);
    setRescheduleAppointment(appointment);
    setShowRescheduleModal(true);
  };

  const AppointmentCard = ({ appointment, isUpcoming = true, onReschedule }) => {
    const appointmentDate = new Date(`${appointment.date} ${appointment.time}`);
    const isToday = appointmentDate.toDateString() === new Date().toDateString();

    return (
      <div className={`card mb-3 border-0 shadow-sm ${isToday ? 'border-primary' : ''}`}>
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div className="d-flex align-items-center">
              <div className={`rounded-circle p-3 me-3 ${isToday ? 'bg-primary' : 'bg-light'}`}> 
                <i className={`bi bi-calendar-event ${isToday ? 'text-white' : 'text-primary'}`} style={{ fontSize: '1.5rem' }}></i>
              </div>
              <div>
                <h6 className="mb-1 fw-bold">{appointment.type}</h6>
                <p className="mb-0 text-muted small">
                  {appointment.doctor || 'Doctor TBD'}
                </p>
              </div>
            </div>
            <div className="text-end">
              {appointment.status === 'Pending' ? (
                <span className="badge bg-warning text-dark">
                  <i className="bi bi-hourglass-split me-1"></i>
                  Pending Payment
                </span>
              ) : (
                getStatusBadge(appointment.status)
              )}
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <div className="d-flex align-items-center">
                <i className="bi bi-calendar-event text-muted me-2"></i>
                <div>
                  <small className="text-muted d-block">Date</small>
                  <span className="fw-medium">
                    {new Date(appointment.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                    {isToday && <span className="badge bg-primary ms-2">Today</span>}
                  </span>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex align-items-center">
                <i className="bi bi-clock text-muted me-2"></i>
                <div>
                  <small className="text-muted d-block">Time</small>
                  <span className="fw-medium">{appointment.time}</span>
                </div>
              </div>
            </div>
          </div>

          {appointment.concern && (
            <div className="mb-3">
              <small className="text-muted d-block mb-1">Concern</small>
              <p className="mb-0 text-secondary">{appointment.concern}</p>
            </div>
          )}

          {isUpcoming && appointment.status === 'Scheduled' && (
            <div className="d-flex gap-2">
              <button className="btn btn-outline-primary btn-sm" onClick={() => onReschedule(appointment)}>
                <i className="bi bi-pencil me-1"></i>Reschedule
              </button>
              <button className="btn btn-outline-danger btn-sm">
                <i className="bi bi-x-circle me-1"></i>Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Debug log
  console.log('showRescheduleModal:', showRescheduleModal, 'rescheduleAppointment:', rescheduleAppointment);

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center min-vh-100">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-primary">Loading your appointments...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold mb-1">My Appointments</h2>
              <p className="text-muted mb-0">Manage and schedule your medical appointments</p>
            </div>
            <button 
              className="btn btn-primary"
              onClick={handleBookNewAppointment}
              disabled={!patientId}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Book New Appointment
            </button>
          </div>
        </div>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          <div className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            <div>
              <strong>Error:</strong> {error}
              <button 
                type="button" 
                className="btn-close ms-2" 
                onClick={() => setError('')}
                aria-label="Close"
              ></button>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success mb-4" role="alert">
          <div className="d-flex align-items-center">
            <i className="bi bi-check-circle-fill me-2"></i>
            <div>
              <strong>Success:</strong> {successMessage}
              <button 
                type="button" 
                className="btn-close ms-2" 
                onClick={() => setSuccessMessage('')}
                aria-label="Close"
              ></button>
            </div>
          </div>
        </div>
      )}

      {/* View Tabs */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              <ul className="nav nav-tabs nav-fill" role="tablist">
                <li className="nav-item" role="presentation">
                  <button 
                    className={`nav-link ${currentView === 'upcoming' ? 'active' : ''}`}
                    onClick={() => setCurrentView('upcoming')}
                    style={{ border: 'none', borderRadius: 0 }}
                  >
                    <i className="bi bi-calendar-check me-2"></i>
                    Upcoming ({upcomingAppointments.length})
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button 
                    className={`nav-link ${currentView === 'past' ? 'active' : ''}`}
                    onClick={() => setCurrentView('past')}
                    style={{ border: 'none', borderRadius: 0 }}
                  >
                    <i className="bi bi-clock-history me-2"></i>
                    Past ({pastAppointments.length})
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="row">
        <div className="col-12">
          {currentView === 'upcoming' ? (
            <div>
              {upcomingAppointments.length > 0 ? (
                <div className="row">
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="col-lg-6 col-xl-4">
                      <AppointmentCard
                        appointment={appointment}
                        isUpcoming={true}
                        onReschedule={handleReschedule}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <div className="mb-4">
                    <i className="bi bi-calendar-x text-muted" style={{ fontSize: '4rem' }}></i>
                  </div>
                  <h5 className="text-muted mb-3">No Upcoming Appointments</h5>
                  <p className="text-muted mb-4">You don't have any scheduled appointments at the moment.</p>
                  <button 
                    className="btn btn-primary"
                    onClick={handleBookNewAppointment}
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Book Your First Appointment
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div>
              {pastAppointments.length > 0 ? (
                <div className="row">
                  {pastAppointments.map((appointment) => (
                    <div key={appointment.id} className="col-lg-6 col-xl-4">
                      <AppointmentCard
                        appointment={appointment}
                        isUpcoming={false}
                        onReschedule={handleReschedule}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <div className="mb-4">
                    <i className="bi bi-clock-history text-muted" style={{ fontSize: '4rem' }}></i>
                  </div>
                  <h5 className="text-muted mb-3">No Past Appointments</h5>
                  <p className="text-muted">Your appointment history will appear here once you have completed appointments.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Appointment Form Modal */}
      {showForm && (
        <AppointmentForm
          isOpen={showForm}
          onSuccess={handleBookingSuccess}
          onCancel={() => {
            setShowForm(false);
            setSuccessMessage('');
          }}
        />
      )}

      {showRescheduleModal && rescheduleAppointment && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2200 }}>
          <AppointmentForm
            isOpen={true}
            initialDoctorId={rescheduleAppointment.doctor_id}
            initialType={rescheduleAppointment.type}
            initialConcern={rescheduleAppointment.concern}
            initialNotes={rescheduleAppointment.notes}
            initialPaymentMethod={rescheduleAppointment.payment_method}
            initialDate={''}
            initialTime={''}
            appointmentId={rescheduleAppointment.id}
            isReschedule={true}
            onSuccess={() => {
              setShowRescheduleModal(false);
              setRescheduleAppointment(null);
              // fetchAppointments(); // Uncomment if you have this function
            }}
            onCancel={() => {
              setShowRescheduleModal(false);
              setRescheduleAppointment(null);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
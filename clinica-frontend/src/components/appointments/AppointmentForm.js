import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { appointmentService } from '../../services/appointmentService';

const AppointmentForm = ({ initialDate = '', initialTime = '', onSuccess, onCancel, isOpen = false }) => {
  const [appointment, setAppointment] = useState({
    date: initialDate,
    time: initialTime,
    doctorId: '',
    type: 'Walk-in', // Add appointment type
    concern: '',
    notes: '',
    paymentMethod: 'Cash',
  });
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [patientId, setPatientId] = useState(null);
  const [patientLoading, setPatientLoading] = useState(true);
  const [patientError, setPatientError] = useState('');
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState('');
  const [isSlotAvailable, setIsSlotAvailable] = useState(true);
  
  useEffect(() => {
    if (isOpen) {
      setPatientLoading(true);
      setPatientError('');
      
      // First try to get patient info via /patients/me endpoint
      api.get('/patients/me')
        .then(data => {
          console.log('Patient data from /patients/me:', data);
          // Handle different possible response structures
          if (data.patient?.id) {
            setPatientId(data.patient.id);
          } else if (data.id) {
            setPatientId(data.id);
          } else {
            throw new Error('No patient ID found in response');
          }
        })
        .catch(err => {
          console.error('Error from /patients/me:', err);

          // Fallback: try to get all patients and find current user
          const currentUserId = JSON.parse(localStorage.getItem('currentUser') || '{}').id;
          api.get('/patients')
            .then(patients => {
              console.log('All patients:', patients);
              const currentPatient = patients.find(p => 
                p.user_id === currentUserId || 
                p.user?.id === currentUserId ||
                p.id === currentUserId
              );
              
              if (currentPatient) {
                setPatientId(currentPatient.id);
              } else {
                // Last resort: use current user ID as patient ID
                console.warn('Using current user ID as patient ID');
                setPatientId(currentUserId);
              }
            })
            .catch(fallbackErr => {
              console.error('Error fetching patients:', fallbackErr);
              setPatientError('Failed to load patient information. Please try again.');
            });
        })
        .finally(() => setPatientLoading(false));
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      api.get('/doctors')
        .then(data => {
          console.log('Doctors data:', data);
          setDoctors(data);
        })
        .catch(err => {
          console.error('Error fetching doctors:', err);
          setError('Failed to load doctors list');
        });
    }
  }, [isOpen]);

  // Update form when initialDate or initialTime props change
  useEffect(() => {
    setAppointment(prev => ({
      ...prev,
      date: initialDate || prev.date,
      time: initialTime || prev.time,
      type: prev.type || 'Walk-in' // Preserve type when updating other fields
    }));
  }, [initialDate, initialTime]);

  const checkAvailability = useCallback(async () => {
    setAvailabilityLoading(true);
    setAvailabilityError('');
    
    try {
      const response = await appointmentService.checkAvailability(
        appointment.date, 
        appointment.time, 
        appointment.doctorId
      );
      
      setIsSlotAvailable(response.available);
      if (!response.available) {
        setAvailabilityError('This time slot is not available. Please choose a different time.');
      }
    } catch (err) {
      console.error('Error checking availability:', err);
      setAvailabilityError('Unable to check availability. Please try again.');
      setIsSlotAvailable(false);
    } finally {
      setAvailabilityLoading(false);
    }
  }, [appointment.date, appointment.time, appointment.doctorId]);

  // Check availability when date, time, or doctor changes
  useEffect(() => {
    if (appointment.date && appointment.time && appointment.doctorId) {
      checkAvailability();
    } else {
      setIsSlotAvailable(true);
      setAvailabilityError('');
    }
  }, [appointment.date, appointment.time, appointment.doctorId, checkAvailability]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!patientId) {
      setError('Patient information not loaded. Please try again.');
      return;
    }

    if (!isFormValid()) {
      setError('Please fill in all required fields');
      return;
    }

    // Don't block submission based on availability check
    // The backend will handle any conflicts and return appropriate errors
    setLoading(true);
    setError('');

    try {
      const appointmentData = {
        patient_id: Number(patientId), // Ensure patient_id is a number
        doctor_id: parseInt(appointment.doctorId),
        date: appointment.date,
        time: appointment.time,
        concern: appointment.concern,
        notes: appointment.notes,
        type: appointment.type, // Use the selected type
        status: 'Scheduled'
      };

      console.log('Submitting appointment data:', appointmentData);
      
      const response = await appointmentService.createAppointment(appointmentData);
      console.log('Appointment created:', response);
      
      setSuccess(true);
      
      // Reset form
      setAppointment({
        date: '',
        time: '',
        doctorId: '',
        type: 'Walk-in',
        concern: '',
        notes: '',
        paymentMethod: 'Cash',
      });
      
      // Call onSuccess callback after a short delay to show success message
      setTimeout(() => {
        if (onSuccess) {
          // Pass the new appointment data back to the parent component
          onSuccess(response);
        }
      }, 1500);
      
    } catch (err) {
      console.error('Error creating appointment:', err);
      
      // Handle specific validation errors from backend
      if (err.response?.data?.errors) {
        const validationErrors = err.response.data.errors;
        const errorMessages = Object.values(validationErrors).flat();
        setError(errorMessages.join('. '));
      } else {
        setError(err.message || 'Failed to schedule appointment. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form state when canceling
    setAppointment({
      date: initialDate,
      time: initialTime,
      doctorId: '',
      type: 'Walk-in',
      concern: '',
      notes: '',
      paymentMethod: 'Cash',
    });
    setSuccess(false);
    setError('');
    setAvailabilityError('');
    setIsSlotAvailable(true);
    
    if (onCancel) {
      onCancel();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  const isFormValid = () => {
    return appointment.date && 
           appointment.time && 
           appointment.doctorId && 
           appointment.type &&
           appointment.concern && 
           appointment.concern.trim().length > 0;
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="modal fade show d-block" 
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={handleBackdropClick}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Schedule New Appointment</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={handleCancel}
              aria-label="Close"
            ></button>
          </div>
          
          <div className="modal-body">
            {patientLoading && (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading patient information...</p>
              </div>
            )}
            
            {patientError && (
              <div className="alert alert-danger">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {patientError}
              </div>
            )}
            
            {success && (
              <div className="alert alert-success">
                <i className="bi bi-check-circle me-2"></i>
                <h5>Appointment Scheduled Successfully!</h5>
                <p>Your appointment has been scheduled. You will receive a confirmation shortly.</p>
              </div>
            )}
            
            {!patientLoading && !patientError && !success && (
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Date <span className="text-danger">*</span></label>
                    <input
                      type="date"
                      className="form-control"
                      value={appointment.date}
                      onChange={(e) => setAppointment({...appointment, date: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Time <span className="text-danger">*</span></label>
                    <input
                      type="time"
                      className="form-control"
                      value={appointment.time}
                      onChange={(e) => setAppointment({...appointment, time: e.target.value})}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Doctor <span className="text-danger">*</span></label>
                    <select
                      className="form-select"
                      value={appointment.doctorId}
                      onChange={(e) => setAppointment({...appointment, doctorId: e.target.value})}
                      required
                    >
                      <option value="">Select a doctor</option>
                      {doctors.map(doctor => (
                        <option key={doctor.id} value={doctor.id}>
                          {doctor.name} {doctor.specialty ? `- ${doctor.specialty}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Appointment Type <span className="text-danger">*</span></label>
                    <select
                      className="form-select"
                      value={appointment.type}
                      onChange={(e) => setAppointment({...appointment, type: e.target.value})}
                      required
                    >
                      <option value="Walk-in">Walk-in</option>
                      <option value="Teleconsultation">Teleconsultation</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Payment Method</label>
                    <select
                      className="form-select"
                      value={appointment.paymentMethod}
                      onChange={(e) => setAppointment({...appointment, paymentMethod: e.target.value})}
                    >
                      <option value="Cash">Cash</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Insurance">Insurance</option>
                    </select>
                  </div>
                  
                  {/* Availability Status */}
                  {appointment.date && appointment.time && appointment.doctorId && (
                    <div className="col-12">
                      {availabilityLoading ? (
                        <div className="alert alert-info">
                          <i className="bi bi-clock me-2"></i>
                          Checking availability...
                        </div>
                      ) : availabilityError ? (
                        <div className="alert alert-warning">
                          <i className="bi bi-exclamation-triangle me-2"></i>
                          {availabilityError}
                        </div>
                      ) : isSlotAvailable ? (
                        <div className="alert alert-success">
                          <i className="bi bi-check-circle me-2"></i>
                          Time slot is available!
                        </div>
                      ) : null}
                    </div>
                  )}
                  
                  <div className="col-12">
                    <label className="form-label">Concern <span className="text-danger">*</span></label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={appointment.concern}
                      onChange={(e) => setAppointment({...appointment, concern: e.target.value})}
                      placeholder="Describe your symptoms or reason for visit"
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Notes (Optional)</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={appointment.notes}
                      onChange={(e) => setAppointment({...appointment, notes: e.target.value})}
                      placeholder="Any additional notes or special requests"
                    />
                  </div>
                </div>

                {error && (
                  <div className="alert alert-danger mt-3">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}
              </form>
            )}
          </div>
          
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleCancel}
            >
              Cancel
            </button>
            {!patientLoading && !patientError && !success && (
              <button
                type="submit"
                className="btn btn-primary px-4"
                style={{ backgroundColor: '#E31937', borderColor: '#E31937' }}
                disabled={loading || !patientId || !isFormValid() || availabilityLoading}
                onClick={handleSubmit}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Scheduling...
                  </>
                ) : (
                  'Schedule Appointment'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentForm;
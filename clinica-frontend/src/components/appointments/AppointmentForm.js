import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { appointmentService } from '../../services/appointmentService';
import PaymentGatewayModal from './PaymentGatewayModal';

const AppointmentForm = ({ initialDate = '', initialTime = '', onSuccess, onCancel, isOpen = false }) => {
  const [appointment, setAppointment] = useState({
    date: initialDate,
    time: initialTime,
    doctorId: '',
    type: 'Walk-in',
    concern: '',
    notes: '',
    paymentMethod: 'credit_card', // Default to Credit Card (backend key)
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
  const [formErrors, setFormErrors] = useState({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(null);
  const [conflictError, setConflictError] = useState('');
  const [timeConflictError, setTimeConflictError] = useState('');
  
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
      type: prev.type || 'Walk-in'
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

  // Check for patient-doctor-time conflict when date, time, or doctor changes
  useEffect(() => {
    if (appointment.date && appointment.time && appointment.doctorId && patientId) {
      appointmentService.checkPatientDoctorTimeConflict({
        patient_id: patientId,
        doctor_id: appointment.doctorId,
        date: appointment.date,
        time: appointment.time,
      })
        .then(res => {
          if (res.conflict) {
            setConflictError(res.message);
          } else {
            setConflictError('');
          }
        })
        .catch(err => {
          setConflictError('Unable to check for conflicting appointments.');
        });
    } else {
      setConflictError('');
    }
  }, [appointment.date, appointment.time, appointment.doctorId, patientId]);

  // Check for patient-time conflict (any doctor) when date or time changes
  useEffect(() => {
    if (appointment.date && appointment.time && patientId) {
      appointmentService.checkPatientTimeConflict({
        patient_id: patientId,
        date: appointment.date,
        time: appointment.time,
      })
        .then(res => {
          if (res.conflict) {
            setTimeConflictError(res.message);
          } else {
            setTimeConflictError('');
          }
        })
        .catch(err => {
          setTimeConflictError('Unable to check for conflicting appointments.');
        });
    } else {
      setTimeConflictError('');
    }
  }, [appointment.date, appointment.time, patientId]);

  const validateField = (field, value) => {
    const errors = { ...formErrors };
    
    switch (field) {
      case 'date':
        if (!value) errors.date = 'Date is required';
        else if (new Date(value) < new Date().setHours(0, 0, 0, 0)) errors.date = 'Date cannot be in the past';
        else delete errors.date;
        break;
      case 'time':
        if (!value) errors.time = 'Time is required';
        else delete errors.time;
        break;
      case 'doctorId':
        if (!value) errors.doctorId = 'Please select a doctor';
        else delete errors.doctorId;
        break;
      case 'concern':
        if (!value || value.trim().length === 0) errors.concern = 'Please describe your concern';
        else if (value.trim().length < 10) errors.concern = 'Please provide more details (at least 10 characters)';
        else delete errors.concern;
        break;
      default:
        // No validation for other fields
        break;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setAppointment(prev => ({ ...prev, [field]: value }));
    
    // Clear any existing error for this field
    if (formErrors[field]) {
      const newErrors = { ...formErrors };
      delete newErrors[field];
      setFormErrors(newErrors);
    }
    
    // Validate on blur for better UX
    setTimeout(() => validateField(field, value), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!patientId) {
      setError('Patient information not loaded. Please try again.');
      return;
    }

    // Validate all fields
    const isValid = ['date', 'time', 'doctorId', 'concern'].every(field => 
      validateField(field, appointment[field])
    );

    if (!isValid) {
      setError('Please fix the errors above before submitting');
      return;
    }

    // Show payment modal before proceeding
    setShowPaymentModal(true);
    setPendingSubmit(() => (confirmed) => processAppointmentSubmission(confirmed));
  };

  const processAppointmentSubmission = async (paymentConfirmed) => {
    setShowPaymentModal(false);
    setLoading(true);
    setError('');
    try {
      const appointmentStatus = paymentConfirmed ? 'Scheduled' : 'Pending';
      const billStatus = paymentConfirmed ? 'Paid' : 'Pending';
      const appointmentData = {
        patient_id: Number(patientId),
        doctor_id: parseInt(appointment.doctorId),
        date: appointment.date,
        time: appointment.time,
        concern: appointment.concern,
        notes: appointment.notes,
        type: appointment.type,
        status: appointmentStatus,
        payment_method: appointment.paymentMethod,
      };
      const response = await appointmentService.createAppointment(appointmentData);
      // Create bill
      try {
        const today = new Date();
        const dueDate = today.toISOString().split('T')[0];
        const randomReceipt = 'RCPT-' + Math.floor(Math.random() * 1000000000);
        await import('../../services/billingService').then(({ billingService }) =>
          billingService.createBill({
            patient_id: response.patient_id,
            doctor_id: response.doctor_id,
            receipt_no: randomReceipt,
            type: 'Downpayment',
            amount: 500,
            status: billStatus,
            payment_method: appointment.paymentMethod,
            due_date: dueDate,
            paid_at: billStatus === 'Paid' ? dueDate : null,
            description: `Downpayment for appointment #${response.id}`,
          })
        );
      } catch (billErr) {
        console.error('Error creating downpayment bill:', billErr);
      }
      setSuccess(true);
      setAppointment({
        date: '',
        time: '',
        doctorId: '',
        type: 'Walk-in',
        concern: '',
        notes: '',
        paymentMethod: 'credit_card',
      });
      setFormErrors({});
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(response);
        }
      }, 1500);
    } catch (err) {
      console.error('Error creating appointment:', err);
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
      paymentMethod: 'credit_card', // Reset to default
    });
    setSuccess(false);
    setError('');
    setFormErrors({});
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
           appointment.concern.trim().length >= 10 &&
           Object.keys(formErrors).length === 0;
  };

  const getFieldClass = (field) => {
    if (formErrors[field]) return 'form-control is-invalid';
    if (appointment[field] && !formErrors[field]) return 'form-control is-valid';
    return 'form-control';
  };

  const getSelectClass = (field) => {
    if (formErrors[field]) return 'form-select is-invalid';
    if (appointment[field] && !formErrors[field]) return 'form-select is-valid';
    return 'form-select';
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="modal fade show d-block" 
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1055 }}
      onClick={handleBackdropClick}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-primary text-white" style={{ backgroundColor: '#E31937 !important' }}>
            <h5 className="modal-title d-flex align-items-center">
              <i className="bi bi-calendar-plus me-2"></i>
              Schedule New Appointment
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={handleCancel}
              aria-label="Close"
            ></button>
          </div>
          
          <div className="modal-body p-4">
            {patientLoading && (
              <div className="text-center py-5">
                <div className="spinner-border text-primary mb-3" role="status" style={{ color: '#E31937 !important' }}>
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted">Loading patient information...</p>
              </div>
            )}
            
            {patientError && (
              <div className="alert alert-danger d-flex align-items-center">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                <div>
                  <strong>Error:</strong> {patientError}
                </div>
              </div>
            )}
            
            {success && (
              <div className="alert alert-success d-flex align-items-center">
                <i className="bi bi-check-circle-fill me-2"></i>
                <div>
                  <h6 className="mb-1">Appointment Scheduled Successfully!</h6>
                  <small>Your appointment has been scheduled. You will receive a confirmation shortly.</small>
                </div>
              </div>
            )}
            
            {!patientLoading && !patientError && !success && (
              <form onSubmit={handleSubmit} noValidate>
                {/* Progress indicator */}
                <div className="mb-4">
                  <div className="progress" style={{ height: '4px' }}>
                    <div 
                      className="progress-bar bg-primary" 
                      style={{ 
                        width: `${(Object.values(appointment).filter(v => v).length / 6) * 100}%`,
                        backgroundColor: '#E31937 !important'
                      }}
                    ></div>
                  </div>
                  <small className="text-muted">
                    {Object.values(appointment).filter(v => v).length} of 6 fields completed
                  </small>
                </div>

                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-calendar3 me-1"></i>
                      Date <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      className={getFieldClass('date')}
                      value={appointment.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      onBlur={(e) => validateField('date', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                    {formErrors.date && (
                      <div className="invalid-feedback">{formErrors.date}</div>
                    )}
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-clock me-1"></i>
                      Time <span className="text-danger">*</span>
                    </label>
                    <input
                      type="time"
                      className={getFieldClass('time')}
                      value={appointment.time}
                      onChange={(e) => handleInputChange('time', e.target.value)}
                      onBlur={(e) => validateField('time', e.target.value)}
                      required
                    />
                    {formErrors.time && (
                      <div className="invalid-feedback">{formErrors.time}</div>
                    )}
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-person-badge me-1"></i>
                      Doctor <span className="text-danger">*</span>
                    </label>
                    <select
                      className={getSelectClass('doctorId')}
                      value={appointment.doctorId}
                      onChange={(e) => handleInputChange('doctorId', e.target.value)}
                      onBlur={(e) => validateField('doctorId', e.target.value)}
                      required
                    >
                      <option value="">Select a doctor</option>
                      {doctors.map(doctor => (
                        <option key={doctor.id} value={doctor.id}>
                          {doctor.name} {doctor.specialty ? `- ${doctor.specialty}` : ''}
                        </option>
                      ))}
                    </select>
                    {formErrors.doctorId && (
                      <div className="invalid-feedback">{formErrors.doctorId}</div>
                    )}
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-type me-1"></i>
                      Appointment Type <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      value={appointment.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      required
                    >
                      <option value="Walk-in">🏥 Walk-in</option>
                      <option value="Teleconsultation">💻 Teleconsultation</option>
                    </select>
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-credit-card me-1"></i>
                      Payment Method
                    </label>
                    <select
                      className="form-select"
                      value={appointment.paymentMethod}
                      onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    >
                      <option value="credit_card">💳 Credit Card</option>
                      <option value="gcash">📱 GCash</option>
                      <option value="paymaya">📱 PayMaya</option>
                    </select>
                  </div>
                  
                  {/* Availability Status */}
                  {/* Show slot availability or conflict error */}
                  {timeConflictError ? (
                    <div className="alert alert-danger mt-2"><strong>Error:</strong> {timeConflictError}</div>
                  ) : conflictError ? (
                    <div className="alert alert-danger mt-2"><strong>Error:</strong> {conflictError}</div>
                  ) : availabilityError ? (
                    <div className="alert alert-danger mt-2"><strong>Error:</strong> {availabilityError}</div>
                  ) : isSlotAvailable && appointment.date && appointment.time && appointment.doctorId ? (
                    <div className="alert alert-success mt-2">Time slot is available!</div>
                  ) : null}
                  
                  <div className="col-12">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-chat-text me-1"></i>
                      Concern <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className={getFieldClass('concern')}
                      rows="3"
                      value={appointment.concern}
                      onChange={(e) => handleInputChange('concern', e.target.value)}
                      onBlur={(e) => validateField('concern', e.target.value)}
                      placeholder="Please describe your symptoms or reason for visit in detail..."
                      required
                    />
                    <div className="form-text">
                      <span className={appointment.concern.length < 10 ? 'text-muted' : 'text-success'}>
                        {appointment.concern.length} characters (minimum 10 required)
                      </span>
                    </div>
                    {formErrors.concern && (
                      <div className="invalid-feedback">{formErrors.concern}</div>
                    )}
                  </div>
                  
                  <div className="col-12">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-journal-text me-1"></i>
                      Additional Notes
                      <small className="text-muted ms-1">(Optional)</small>
                    </label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={appointment.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="Any additional notes, special requests, or medication allergies..."
                    />
                  </div>
                </div>

                {error && (
                  <div className="alert alert-danger d-flex align-items-center mt-4">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    <div>
                      <strong>Error:</strong> {error}
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>
          
          <div className="modal-footer bg-light">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleCancel}
            >
              <i className="bi bi-x-circle me-1"></i>
              Cancel
            </button>
            {!patientLoading && !patientError && !success && (
              <button
                type="submit"
                className="btn btn-primary px-4"
                style={{ backgroundColor: '#E31937', borderColor: '#E31937' }}
                disabled={loading || !patientId || !isFormValid() || availabilityLoading || !!conflictError || !!timeConflictError}
                onClick={handleSubmit}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Scheduling...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-1"></i>
                    Schedule Appointment
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Payment Gateway Modal */}
      <PaymentGatewayModal
        show={showPaymentModal}
        paymentMethod={appointment.paymentMethod}
        onConfirm={() => pendingSubmit && pendingSubmit(true)}
        onCancel={() => pendingSubmit && pendingSubmit(false)}
      />
    </div>
  );
};

export default AppointmentForm;
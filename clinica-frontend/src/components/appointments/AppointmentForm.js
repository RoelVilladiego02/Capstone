import React, { useState, useEffect, useCallback } from 'react';
import { doctorService } from '../../services/doctorService';
import { appointmentService } from '../../services/appointmentService';
import PaymentGatewayModal from './PaymentGatewayModal';
import { api } from '../../services/api';

// Helper: get weekday string from date (e.g., 'Monday')
const getWeekday = (dateStr) => {
  if (!dateStr) return null;
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const d = new Date(dateStr);
  return days[d.getDay()];
};

// Adjusted concerns and mapping for your clinic's specializations
const COMMON_CONCERNS = [
  { label: 'Cough / Breathing Issues', value: 'CoughBreathing' },
  { label: 'Chest Pain / Heart Issues', value: 'ChestPainHeart' },
  { label: 'Surgery Consultation', value: 'Surgery' },
  { label: 'General Adult Checkup / Illness', value: 'GeneralAdult' },
  { label: 'Child Health / Pediatric', value: 'Pediatric' },
  { label: 'Women\'s Health / OB-Gyne', value: 'OBGyne' },
  { label: 'Other', value: 'Other' }
];

const CONCERN_TO_SPECIALIZATION = {
  'CoughBreathing': ['IM-PULMONOLOGY'],
  'ChestPainHeart': ['IM-CARDIOLOGY-HEART FAILURE CHEST PAIN SPECIALIST'],
  'Surgery': ['GENERAL SURGERY'],
  'GeneralAdult': [
    'INTERNAL MEDICINE',
    'GENERAL PHYSICIAN/URGENT CARE',
    'GENERAL PHYSICIAN'
  ],
  'Pediatric': ['PEDIATRICIAN CHILD HEALTH'],
  'OBGyne': ['OB GYNE'],
};

const AppointmentForm = ({ initialDate = '', initialTime = '', initialDoctorId = '', initialType = 'Walk-in', initialConcern = '', initialNotes = '', initialPaymentMethod = 'credit_card', onSuccess, onCancel, isOpen = false, isReschedule = false, appointmentId = null, hidePaymentFields = false }) => {
  const [appointment, setAppointment] = useState({
    date: initialDate,
    time: initialTime,
    doctorId: initialDoctorId,
    type: initialType,
    concern: initialConcern,
    notes: initialNotes,
    paymentMethod: initialPaymentMethod, // Default to Credit Card (backend key)
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [patient, setPatient] = useState(null);
  const [patientLoading, setPatientLoading] = useState(true);
  const [patientError, setPatientError] = useState('');
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState('');
  const [isSlotAvailable, setIsSlotAvailable] = useState(true);
  const [formErrors, setFormErrors] = useState({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [conflictError, setConflictError] = useState('');
  const [timeConflictError, setTimeConflictError] = useState('');
  const [allDoctors, setAllDoctors] = useState([]); // store all doctors
  const [selectedConcern, setSelectedConcern] = useState(initialConcern && COMMON_CONCERNS.some(c => c.value === initialConcern) ? initialConcern : (initialConcern ? 'Other' : ''));
  const [otherConcern, setOtherConcern] = useState(initialConcern && !COMMON_CONCERNS.some(c => c.value === initialConcern) ? initialConcern : '');
  const [successMessage, setSuccessMessage] = useState(null);
  
  useEffect(() => {
    if (isOpen) {
      setPatientLoading(true);
      setPatientError('');
      
      // First try to get patient info via /patients/me endpoint
      api.get('/patients/me')
        .then(res => {
          setPatient(res.patient || res);
          setPatientLoading(false);
        })
        .catch(() => setPatientLoading(false));
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      doctorService.getDoctors()
        .then(data => {
          setAllDoctors(data);
        })
        .catch(err => {
          setError('Failed to load doctors list');
        });
    }
  }, [isOpen]);

  // Filter doctors ONLY by concern specialization (not by date/time)
  let filteredDoctors = allDoctors.filter(doc => {
    if (!selectedConcern || selectedConcern === 'Other') return true;
    const mappedSpecs = CONCERN_TO_SPECIALIZATION[selectedConcern] || [];
    return mappedSpecs.includes(doc.specialization);
  });

  // Get available time slots for selected doctor and date
  const selectedDoctor = allDoctors.find(doc => String(doc.id) === String(appointment.doctorId));
  // Helper to generate 30-min slots from time_availability
  function generateTimeSlots(timeAvailability, slotMinutes = 30) {
    if (!Array.isArray(timeAvailability)) return [];
    const slots = [];
    for (const range of timeAvailability) {
      if (!range.start || !range.end) continue;
      let [startHour, startMin] = range.start.split(':').map(Number);
      let [endHour, endMin] = range.end.split(':').map(Number);
      let start = new Date(0, 0, 0, startHour, startMin);
      let end = new Date(0, 0, 0, endHour, endMin);
      while (start <= end) {
        const h = String(start.getHours()).padStart(2, '0');
        const m = String(start.getMinutes()).padStart(2, '0');
        slots.push(`${h}:${m}`);
        start = new Date(start.getTime() + slotMinutes * 60000);
      }
    }
    return slots;
  }

  let availableTimes = [];
  if (selectedDoctor && Array.isArray(selectedDoctor.time_availability) && appointment.date) {
    // Only use time ranges for the selected date
    availableTimes = generateTimeSlots(selectedDoctor.time_availability, 30);
  }

  // Update form when initialDate, initialTime, or other initial props change
  useEffect(() => {
    setAppointment(prev => ({
      ...prev,
      date: initialDate || prev.date,
      time: initialTime || prev.time,
      doctorId: initialDoctorId || prev.doctorId,
      type: initialType || prev.type,
      concern: initialConcern || prev.concern,
      notes: initialNotes || prev.notes,
      paymentMethod: initialPaymentMethod || prev.paymentMethod,
    }));
    // Set selectedConcern and otherConcern
    if (initialConcern) {
      if (COMMON_CONCERNS.some(c => c.value === initialConcern)) {
        setSelectedConcern(initialConcern);
        setOtherConcern('');
      } else {
        setSelectedConcern('Other');
        setOtherConcern(initialConcern);
      }
    }
  }, [initialDate, initialTime, initialDoctorId, initialType, initialConcern, initialNotes, initialPaymentMethod]);

  // Update concern in appointment state when dropdown or textarea changes
  useEffect(() => {
    if (selectedConcern === 'Other') {
      setAppointment(prev => ({ ...prev, concern: otherConcern }));
    } else if (selectedConcern) {
      setAppointment(prev => ({ ...prev, concern: selectedConcern }));
    }
  }, [selectedConcern, otherConcern]);

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
    if (appointment.date && appointment.time && appointment.doctorId && patient) {
      appointmentService.checkPatientDoctorTimeConflict({
        patient_id: patient.id,
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
  }, [appointment.date, appointment.time, appointment.doctorId, patient]);

  // Check for patient-time conflict (any doctor) when date or time changes
  useEffect(() => {
    if (appointment.date && appointment.time && patient) {
      appointmentService.checkPatientTimeConflict({
        patient_id: patient.id,
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
  }, [appointment.date, appointment.time, patient]);

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
        if (selectedConcern === 'Other') {
          if (!value || value.trim().length === 0) errors.concern = 'Please describe your concern';
          else if (value.trim().length < 10) errors.concern = 'Please provide more details (at least 10 characters)';
          else delete errors.concern;
        } else {
          if (!selectedConcern) errors.concern = 'Please select a concern';
          else delete errors.concern;
        }
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

  // When user clicks Schedule Appointment, show the payment modal
  const handleScheduleClick = (e) => {
    e.preventDefault();
    setShowPaymentModal(true);
  };

  // When user confirms payment
  const handlePaymentConfirm = async () => {
    setShowPaymentModal(false);
    await handleSubmit('Scheduled');
  };

  // When user cancels payment
  const handlePaymentCancel = async () => {
    setShowPaymentModal(false);
    await handleSubmit('Pending');
  };

  // Refactor handleSubmit to accept status
  const handleSubmit = async (statusOverride) => {
    setLoading(true);
    setFormErrors({});
    setConflictError(null);
    setTimeConflictError(null);

    // Find the selected doctor object
    const selectedDoctor = allDoctors.find(doc => String(doc.id) === String(appointment.doctorId));

    // Prepare payload: use doctor_id (not user_id)
    const payload = {
      ...appointment,
      doctor_id: selectedDoctor?.id, // Use doctor.id (doctors table)
      patient_id: patient.id,
      status: isReschedule ? 'Scheduled' : (statusOverride || 'Scheduled'), // Always set to Scheduled for reschedules
      payment_method: appointment.paymentMethod, // Ensure payment_method is sent
    };

    try {
      let createdOrUpdatedAppointment;
      if (isReschedule && appointmentId) {
        console.log('Rescheduling appointment:', appointmentId, 'with payload:', payload);
        // UPDATE existing appointment with just the new date and time
        createdOrUpdatedAppointment = await appointmentService.updateAppointment(appointmentId, {
          date: payload.date,
          time: payload.time,
          status: 'Scheduled' // Ensure it stays scheduled
        });
        console.log('Appointment rescheduled:', createdOrUpdatedAppointment);
        
        // Skip bill creation for reschedules since we're just updating the appointment
        setSuccess(true);
        return;
      }

      // For new appointments, continue with existing logic
      createdOrUpdatedAppointment = await appointmentService.createAppointment(payload);
      // Now create the bill, using the new appointment's id and correct patient/doctor ids
      try {
        const today = new Date();
        const dueDate = today.toISOString().split('T')[0];
        const randomReceipt = 'RCPT-' + Math.floor(Math.random() * 1000000000);
        if (!createdOrUpdatedAppointment.id || !createdOrUpdatedAppointment.patient_id || !createdOrUpdatedAppointment.doctor_id) {
          console.error('Missing required fields for bill creation:', createdOrUpdatedAppointment);
          setError('Failed to create bill: missing appointment information.');
          return;
        }
        await import('../../services/billingService').then(({ billingService }) =>
          billingService.createBill({
            patient_id: createdOrUpdatedAppointment.patient_id,
            doctor_id: selectedDoctor?.id, // Use doctor.id (doctors table)
            receipt_no: randomReceipt,
            type: 'Downpayment',
            amount: 500,
            status: statusOverride === 'Scheduled' ? 'Paid' : 'Pending',
            payment_method: appointment.paymentMethod,
            due_date: dueDate,
            paid_at: null,
            description: `Downpayment for appointment #${createdOrUpdatedAppointment.id}`,
            appointment_id: createdOrUpdatedAppointment.id,
          })
        );
      } catch (billErr) {
        console.error('Error creating downpayment bill:', billErr);
        setError('Failed to create bill for this appointment. Please contact support.');
      }
      
      setSuccess(true);
      // Set different success messages based on payment status
      if (statusOverride === 'Pending') {
        setSuccessMessage({
          title: 'Appointment Reserved',
          body: 'Your appointment is pending payment. Please note that this slot may be taken by another patient who pays first.'
        });
      } else {
        setSuccessMessage({
          title: 'Appointment Scheduled Successfully!',
          body: 'Your appointment has been confirmed and scheduled. You will receive a confirmation shortly.'
        });
      }

      // Reset form
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
      setSelectedConcern('');
      setOtherConcern('');

      // Clear success message and close form after delay
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(createdOrUpdatedAppointment);
        }
        setSuccess(false);
        setSuccessMessage(null);
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
    setSelectedConcern(''); // Reset dropdown
    setOtherConcern(''); // Reset textarea
    
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
    if (!appointment.date || !appointment.time || !appointment.doctorId || !appointment.type || !appointment.concern) return false;
    if (selectedConcern === 'Other') {
      if (!appointment.concern.trim() || appointment.concern.trim().length < 10) return false;
    }
    return Object.keys(formErrors).length === 0;
  };

  const getFieldClass = (field) => {
    if (
      formErrors[field] ||
      (field === 'date' && (conflictError || timeConflictError)) ||
      (field === 'time' && (conflictError || timeConflictError))
    ) return 'form-control is-invalid';
    if (appointment[field] && !formErrors[field]) return 'form-control is-valid';
    return 'form-control';
  };

  if (!isOpen) {
    return null;
  }

  if (patientLoading) return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1055 }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">Loading Appointment Form</h5>
          </div>
          <div className="modal-body p-5">
            <div className="d-flex flex-column align-items-center justify-content-center py-4">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-primary mb-0">Loading patient information...</p>
              <small className="text-muted">Please wait while we set up your appointment form</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!patient) return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1055 }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-danger text-white">
            <h5 className="modal-title">Error Loading Profile</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onCancel} aria-label="Close"></button>
          </div>
          <div className="modal-body p-4">
            <div className="alert alert-danger mb-0">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              Unable to load patient profile. Please contact support.
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );

  const selectedWeekday = getWeekday(appointment.date);

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
              {isReschedule ? 'Reschedule Appointment' : 'Schedule New Appointment'}
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={handleCancel}
              aria-label="Close"
            ></button>
          </div>
          
          <div className="modal-body p-4">
            
            {patientError && (
              <div className="alert alert-danger d-flex align-items-center">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                <div>
                  <strong>Error:</strong> {patientError}
                </div>
              </div>
            )}
            
            {success && successMessage && (
              <div className="alert alert-success d-flex align-items-center">
                <i className="bi bi-check-circle-fill me-2"></i>
                <div>
                  <h6 className="mb-1">{successMessage.title}</h6>
                  <small>{successMessage.body}</small>
                </div>
              </div>
            )}
            
            {!patientLoading && !patientError && !success && (
              <form onSubmit={handleScheduleClick} noValidate>
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
                  {/* Doctor selection as cards */}
                  <div className="col-md-12 mb-3">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-person-badge me-1"></i>
                      Doctor <span className="text-danger">*</span>
                    </label>
                    {filteredDoctors.length === 0 ? (
                      <div className="alert alert-warning mt-2">
                        {selectedConcern && selectedConcern !== 'Other'
                          ? 'No doctors with the required specialization are available for the selected day. Please choose another concern or date.'
                          : 'No doctors are available for the selected day. Please choose another date.'}
                      </div>
                    ) : (
                      <div className="list-group doctor-list mb-2" style={{ maxHeight: 320, overflowY: 'auto' }}>
                        {filteredDoctors.map(doc => {
                          const selected = appointment.doctorId === doc.id;
                          const notAvailable = selectedWeekday && (!Array.isArray(doc.available_days) || !doc.available_days.includes(selectedWeekday));
                          return (
                            <button
                              type="button"
                              key={doc.id}
                              className={`list-group-item list-group-item-action d-flex align-items-center gap-3 ${selected ? 'border-primary bg-light shadow-sm' : ''}`}
                              onClick={() => handleInputChange('doctorId', doc.id)}
                              style={{ cursor: 'pointer', borderWidth: selected ? 2 : 1 }}
                              tabIndex={0}
                            >
                              <div className="avatar rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                                {doc.user?.name?.charAt(0) || doc.name?.charAt(0) || 'D'}
                              </div>
                              <div className="flex-grow-1">
                                <div className="fw-semibold">{doc.user?.name || doc.name || 'Doctor'}</div>
                                <div className="small text-muted">{doc.specialization || 'N/A'}</div>
                                <div className="small">
                                  <i className="bi bi-calendar-week me-1"></i>
                                  {Array.isArray(doc.available_days) ? doc.available_days.join(', ') : 'N/A'}
                                  <span className="mx-2">|</span>
                                  <i className="bi bi-clock me-1"></i>
                                  {Array.isArray(doc.time_availability) && doc.time_availability.length > 0
                                    ? doc.time_availability.map(t => t.start && t.end ? `${t.start}–${t.end}` : t).join(', ')
                                    : 'N/A'}
                                </div>
                                {notAvailable && (
                                  <div className="alert alert-warning py-1 px-2 mt-2 mb-0" style={{ fontSize: '0.95em' }}>
                                    Doctor may not be available on this day.
                                  </div>
                                )}
                              </div>
                              {selected && (
                                <i className="bi bi-check-circle-fill text-primary fs-4 ms-auto"></i>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {formErrors.doctorId && (
                      <div className="invalid-feedback d-block">{formErrors.doctorId}</div>
                    )}
                  </div>
                  
                  {/* Date and Time fields */}
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
                    {selectedDoctor && availableTimes.length === 0 && (
                      <div className="alert alert-warning mt-2">No available time slots for this doctor on this day.</div>
                    )}
                    {selectedDoctor && availableTimes.length > 0 ? (
                      <select
                        className={getFieldClass('time')}
                        value={appointment.time}
                        onChange={e => handleInputChange('time', e.target.value)}
                        onBlur={e => validateField('time', e.target.value)}
                        required
                      >
                        <option value="">Select a time</option>
                        {availableTimes.map((time, idx) => (
                          <option key={idx} value={time}>{time}</option>
                        ))}
                      </select>
                    ) : !selectedDoctor ? (
                      <input
                        type="time"
                        className={getFieldClass('time')}
                        value={appointment.time}
                        onChange={e => handleInputChange('time', e.target.value)}
                        onBlur={e => validateField('time', e.target.value)}
                        required
                      />
                    ) : null}
                    {formErrors.time && (
                      <div className="invalid-feedback">{formErrors.time}</div>
                    )}
                  </div>
                  
                  {/* Only show type if not rescheduling */}
                  {!isReschedule && (
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
                  )}
                  {/* Only show payment method if not rescheduling and not hidePaymentFields */}
                  {!isReschedule && !hidePaymentFields && (
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
                  )}
                  {/* Only show concern and notes if not rescheduling */}
                  {!isReschedule && (
                    <>
                      <div className="col-12">
                        <label className="form-label fw-semibold">
                          <i className="bi bi-chat-text me-1"></i>
                          What is your main concern? <span className="text-danger">*</span>
                        </label>
                        <select
                          className={formErrors.concern ? 'form-select is-invalid' : 'form-select'}
                          value={selectedConcern}
                          onChange={e => {
                            setSelectedConcern(e.target.value);
                            if (e.target.value !== 'Other') setOtherConcern('');
                          }}
                          required
                        >
                          <option value="">Select a concern</option>
                          {COMMON_CONCERNS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        {selectedConcern === 'Other' && (
                          <textarea
                            className={formErrors.concern ? 'form-control is-invalid' : 'form-control'}
                            rows="3"
                            value={otherConcern}
                            onChange={e => setOtherConcern(e.target.value)}
                            onBlur={e => validateField('concern', e.target.value)}
                            placeholder="Please describe your symptoms or reason for visit in detail..."
                            required
                          />
                        )}
                        <div className="form-text">
                          {selectedConcern === 'Other' ? (
                            <span className={otherConcern.length < 10 ? 'text-muted' : 'text-success'}>
                              {otherConcern.length} characters (minimum 10 required)
                            </span>
                          ) : (
                            <span className="text-success">Selected: {COMMON_CONCERNS.find(c => c.value === selectedConcern)?.label || 'None'}</span>
                          )}
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
                    </>
                  )}
                  
                  {/* Availability Status */}
                  {/* Show slot availability or conflict error */}
                  {/* Availability/Conflict Feedback - moved here for immediate feedback */}
                  <div className="row">
                    <div className="col-md-12">
                      {timeConflictError ? (
                        <div className="alert alert-danger mt-2"><strong>Error:</strong> {timeConflictError}</div>
                      ) : conflictError ? (
                        <div className="alert alert-danger mt-2"><strong>Error:</strong> {conflictError}</div>
                      ) : availabilityError ? (
                        <div className="alert alert-danger mt-2"><strong>Error:</strong> {availabilityError}</div>
                      ) : isSlotAvailable && appointment.date && appointment.time && appointment.doctorId ? (
                        <div className="row">
                          <div className="col-md-6">
                            <div 
                              className="alert alert-success d-flex align-items-center py-1 px-2 mt-2 mb-0"
                              style={{ fontSize: '0.97em' }}
                            >
                              <i className="bi bi-check-circle-fill me-2"></i>
                              Time slot is available!
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
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
                disabled={loading || !patient || !isFormValid() || availabilityLoading || !!conflictError || !!timeConflictError}
                onClick={handleScheduleClick}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    {isReschedule ? 'Rescheduling...' : 'Scheduling...'}
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-1"></i>
                    {isReschedule ? 'Reschedule Appointment' : 'Schedule Appointment'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Payment Gateway Modal - only show if not rescheduling */}
      {!isReschedule && (
        <PaymentGatewayModal
          show={showPaymentModal}
          onConfirm={handlePaymentConfirm}
          onCancel={handlePaymentCancel}
          paymentMethod={appointment.paymentMethod}
        />
      )}
    </div>
  );
};

export default AppointmentForm;
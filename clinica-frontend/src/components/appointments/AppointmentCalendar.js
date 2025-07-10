import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { appointmentService } from '../../services/appointmentService';
import AppointmentForm from './AppointmentForm';

const AppointmentCalendar = () => {
  const [date, setDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]); // For checking all appointments
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  const [availabilityLoading, setAvailabilityLoading] = useState({});

  // Get current user info
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const patientId = currentUser?.id;

  // Fetch patient's appointments for the selected date AND all appointments for that date
  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      setError('');
      
      try {
        const selectedDate = date.toISOString().split('T')[0];
        
        // Fetch patient's appointments for the selected date
        const patientAppointments = await appointmentService.getAppointments({
          patient_id: patientId,
          date: selectedDate
        });
        
        // Fetch ALL appointments for the selected date to check availability
        const allAppointmentsForDate = await appointmentService.getAppointments({
          date: selectedDate
        });
        
        setAppointments(patientAppointments || []);
        setAllAppointments(allAppointmentsForDate || []);
        
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError(err.message || 'Failed to fetch appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [date, showForm, patientId]);

  // Available time slots
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  // Filter appointments for the selected date (patient's appointments)
  const appointmentsForDate = appointments;

  // Function to normalize time format (handles both HH:MM and HH:MM:SS)
  const normalizeTime = (time) => {
    if (!time) return '';
    // If time includes seconds, remove them
    if (time.includes(':') && time.split(':').length === 3) {
      return time.substring(0, 5); // Get only HH:MM
    }
    return time;
  };

  // Check if a time slot is occupied by the current patient
  const getPatientAppointmentByTime = (time) => {
    return appointmentsForDate.find(apt => normalizeTime(apt.time) === time);
  };

  // Check if a time slot is occupied by ANY patient (for availability checking)
  const isTimeSlotOccupied = (time) => {
    return allAppointments.some(apt => normalizeTime(apt.time) === time);
  };

  // Get the appointment for a specific time slot (could be any patient)
  const getAppointmentByTime = (time) => {
    return allAppointments.find(apt => normalizeTime(apt.time) === time);
  };

  const getAppointmentTypeColor = (type) => {
    switch(type) {
      case 'Walk-in': return 'primary';
      case 'Online': return 'success';
      case 'Teleconsultation': return 'info';
      default: return 'secondary';
    }
  };

  const handleBookSlot = async (time) => {
    // Double-check if slot is available before opening form
    if (isTimeSlotOccupied(time)) {
      alert('This time slot is no longer available. Please choose another time.');
      return;
    }
    
    // Check availability with backend
    setAvailabilityLoading(prev => ({ ...prev, [time]: true }));
    
    try {
      const selectedDate = date.toISOString().split('T')[0];
      const availabilityResponse = await appointmentService.checkAvailability(selectedDate, time);
      
      if (!availabilityResponse.available) {
        alert('This time slot is no longer available. Please choose another time.');
        return;
      }
      
      setSelectedTime(time);
      setShowForm(true);
    } catch (err) {
      console.error('Error checking availability:', err);
      alert('Unable to verify slot availability. Please try again.');
    } finally {
      setAvailabilityLoading(prev => ({ ...prev, [time]: false }));
    }
  };

  const handleNewAppointment = () => {
    setSelectedTime('');
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedTime('');
    // The useEffect will automatically refetch appointments when showForm changes
  };

  // Check if we have appointments data to show dots on calendar
  const hasAppointmentsOnDate = (calDate) => {
    return appointments.some(apt => {
      if (!apt.date) return false;
      return new Date(apt.date).toDateString() === calDate.toDateString();
    });
  };

  return (
    <>
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="row g-4">
            <div className="col-md-6">
              <div className="calendar-wrapper">
                <Calendar
                  onChange={setDate}
                  value={date}
                  className="w-100 border-0 shadow-sm"
                  tileClassName="rounded"
                  minDate={new Date()}
                  tileContent={({ date: calDate }) => {
                    // Show dot if the current patient has an appointment on this date
                    const hasAppointments = hasAppointmentsOnDate(calDate);
                    return hasAppointments ? (
                      <div className="position-absolute bottom-0 start-50 translate-middle-x mb-1">
                        <div className="dot bg-primary rounded-circle" style={{ width: '4px', height: '4px' }}></div>
                      </div>
                    ) : null;
                  }}
                />
              </div>
            </div>

            <div className="col-md-6">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0">Schedule for {date.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</h5>
                <button 
                  className="btn btn-sm" 
                  style={{ backgroundColor: '#E31937', color: 'white' }}
                  onClick={handleNewAppointment}
                >
                  <i className="bi bi-plus-lg me-1"></i>
                  New Appointment
                </button>
              </div>

              {loading && <div className="text-center py-4">Loading appointments...</div>}
              {error && <div className="alert alert-danger">{error}</div>}

              <div className="time-slots-wrapper" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {timeSlots.map(time => {
                  const patientAppointment = getPatientAppointmentByTime(time);
                  const isPatientSlot = !!patientAppointment;
                  // Find any appointment for this slot
                  const slotAppointment = allAppointments.find(apt => normalizeTime(apt.time) === time);
                  const isLoading = availabilityLoading[time];
                  
                  return (
                    <div 
                      key={time} 
                      className={`time-slot p-3 mb-2 rounded ${
                        isPatientSlot 
                          ? 'bg-light border border-primary' 
                          : slotAppointment 
                            ? 'bg-secondary bg-opacity-10 border border-secondary' 
                            : 'border border-dashed'
                      }`}
                    >
                      <div className="d-flex align-items-center">
                        <div className="time-indicator me-3">
                          <strong>{time}</strong>
                        </div>
                        
                        {isPatientSlot ? (
                          // Show only the current patient's appointment summary (no Book Slot button)
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <h6 className="mb-1 text-primary">Your Appointment</h6>
                                <small className="text-muted d-block">
                                  with {patientAppointment.doctorName || `Doctor ${patientAppointment.doctor_id}`}
                                </small>
                                <small className="text-muted d-block">
                                  Concern: {patientAppointment.concern || 'No concern specified'}
                                </small>
                              </div>
                              <span className={`badge bg-${getAppointmentTypeColor(patientAppointment.type)}`}>
                                {patientAppointment.type || 'Walk-in'}
                              </span>
                            </div>
                            <div className="mt-2">
                              <button className="btn btn-sm btn-outline-primary me-2">
                                <i className="bi bi-pencil me-1"></i>
                                Edit
                              </button>
                              <button className="btn btn-sm btn-outline-danger">
                                <i className="bi bi-trash me-1"></i>
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : slotAppointment ? (
                          // Show summary of the appointment (not current patient)
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <h6 className="mb-1 text-secondary">Booked</h6>
                                <small className="text-muted d-block">
                                  with {slotAppointment.doctorName || `Doctor ${slotAppointment.doctor_id}`}
                                </small>
                                <small className="text-muted d-block">
                                  Concern: {slotAppointment.concern || 'No concern specified'}
                                </small>
                              </div>
                              <span className={`badge bg-${getAppointmentTypeColor(slotAppointment.type)}`}>
                                {slotAppointment.type || 'Walk-in'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          // Show available slot (only if patient has no appointment in this slot)
                          <div className="flex-grow-1 text-center">
                            <button 
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleBookSlot(time)}
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                  Checking...
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-plus-lg me-1"></i>
                                  Book Slot
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .calendar-wrapper .react-calendar {
            border: none;
            width: 100%;
            padding: 1rem;
            border-radius: 0.5rem;
          }
          .calendar-wrapper .react-calendar__tile--active {
            background: #E31937;
            border-radius: 0.25rem;
          }
          .calendar-wrapper .react-calendar__tile--now {
            background: #f8d7da;
            border-radius: 0.25rem;
          }
          .border-dashed {
            border-style: dashed !important;
          }
          .time-slot {
            transition: all 0.2s ease;
          }
          .time-slot:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          }
        `}</style>
      </div>

      {/* Modal Form */}
      <AppointmentForm 
        isOpen={showForm}
        initialDate={date.toISOString().split('T')[0]}
        initialTime={selectedTime}
        onSuccess={handleFormClose}
        onCancel={handleFormClose}
      />
    </>
  );
};

export default AppointmentCalendar;
import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const AppointmentCalendar = () => {
  const [date, setDate] = useState(new Date());
  const [appointments] = useState([
    { 
      id: 1, 
      time: '09:00', 
      patient: 'John Doe', 
      doctor: 'Dr. Smith',
      concern: 'Fever and Headache',
      type: 'Walk-in',
      status: 'Confirmed'
    },
    { 
      id: 2, 
      time: '10:00', 
      patient: 'Jane Smith', 
      doctor: 'Dr. Johnson',
      concern: 'Regular Check-up',
      type: 'Online',
      status: 'Scheduled'
    },
    { 
      id: 3, 
      time: '11:00', 
      patient: 'Robert Brown', 
      doctor: 'Dr. Wilson',
      concern: 'Follow-up Consultation',
      type: 'Teleconsult',
      status: 'Scheduled'
    }
  ]);

  // Available time slots
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  const getAppointmentByTime = (time) => {
    return appointments.find(apt => apt.time === time);
  };

  const getAppointmentTypeColor = (type) => {
    switch(type) {
      case 'Walk-in': return 'primary';
      case 'Online': return 'success';
      case 'Teleconsult': return 'info';
      default: return 'secondary';
    }
  };

  return (
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
                // Customize calendar appearance
                tileContent={({ date }) => {
                  const hasAppointments = appointments.some(
                    apt => new Date(apt.date).toDateString() === date.toDateString()
                  );
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
              <button className="btn btn-sm" style={{ backgroundColor: '#E31937', color: 'white' }}>
                <i className="bi bi-plus-lg me-1"></i>
                New Appointment
              </button>
            </div>

            <div className="time-slots-wrapper" style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {timeSlots.map(time => {
                const appointment = getAppointmentByTime(time);
                return (
                  <div 
                    key={time} 
                    className={`time-slot p-3 mb-2 rounded ${
                      appointment ? 'bg-light border' : 'border border-dashed'
                    }`}
                  >
                    <div className="d-flex align-items-center">
                      <div className="time-indicator me-3">
                        <strong>{time}</strong>
                      </div>
                      {appointment ? (
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h6 className="mb-1">{appointment.patient}</h6>
                              <small className="text-muted d-block">with {appointment.doctor}</small>
                              <small className="text-muted d-block">Concern: {appointment.concern}</small>
                            </div>
                            <span className={`badge bg-${getAppointmentTypeColor(appointment.type)}`}>
                              {appointment.type}
                            </span>
                          </div>
                          <div className="mt-2">
                            <button className="btn btn-sm btn-outline-secondary me-2">
                              <i className="bi bi-pencil me-1"></i>
                              Edit
                            </button>
                            <button className="btn btn-sm btn-outline-danger">
                              <i className="bi bi-trash me-1"></i>
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-grow-1 text-center">
                          <button className="btn btn-sm btn-outline-primary">
                            <i className="bi bi-plus-lg me-1"></i>
                            Book Slot
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
      `}</style>
    </div>
  );
};

export default AppointmentCalendar;

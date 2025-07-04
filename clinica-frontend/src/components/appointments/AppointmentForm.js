import React, { useState } from 'react';

const AppointmentForm = () => {
  const [appointment, setAppointment] = useState({
    patientName: '',
    date: '',
    time: '',
    doctorId: '',
    concern: '',
    notes: ''
  });

  // Mock data for doctors and their specializations
  const doctors = [
    { id: 1, name: 'Dr. Smith', specialization: 'General Medicine', schedule: '9:00 AM - 5:00 PM' },
    { id: 2, name: 'Dr. Johnson', specialization: 'Pediatrics', schedule: '8:00 AM - 4:00 PM' },
    { id: 3, name: 'Dr. Williams', specialization: 'OB-GYN', schedule: '10:00 AM - 6:00 PM' },
    { id: 4, name: 'Dr. Brown', specialization: 'General Medicine', schedule: '7:00 AM - 3:00 PM' }
  ];

  // Common patient concerns
  const concerns = [
    { value: 'general-checkup', label: 'General Check-up', specialty: 'General Medicine' },
    { value: 'follow-up', label: 'Follow-up Consultation', specialty: 'General Medicine' },
    { value: 'pediatric-checkup', label: 'Pediatric Check-up', specialty: 'Pediatrics' },
    { value: 'pregnancy', label: 'Pregnancy Consultation', specialty: 'OB-GYN' },
    { value: 'vaccination', label: 'Vaccination', specialty: 'Pediatrics' },
    { value: 'womens-health', label: "Women's Health", specialty: 'OB-GYN' }
  ];

  // Time slots
  const timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', 
    '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM'
  ];

  const getAvailableDoctors = () => {
    if (!appointment.concern) return [];
    const selectedConcern = concerns.find(c => c.value === appointment.concern);
    return doctors.filter(doc => doc.specialization === selectedConcern?.specialty);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Appointment data:', appointment);
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-white">
        <h5 className="card-title mb-0">Schedule New Appointment</h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Patient Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter patient name"
                value={appointment.patientName}
                onChange={(e) => setAppointment({
                  ...appointment,
                  patientName: e.target.value
                })}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Reason for Visit</label>
              <select 
                className="form-select"
                value={appointment.concern}
                onChange={(e) => setAppointment({
                  ...appointment,
                  concern: e.target.value,
                  doctorId: '' // Reset doctor when concern changes
                })}
                required
              >
                <option value="">Select reason</option>
                {concerns.map(concern => (
                  <option key={concern.value} value={concern.value}>
                    {concern.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">Preferred Date</label>
              <input
                type="date"
                className="form-control"
                value={appointment.date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setAppointment({
                  ...appointment,
                  date: e.target.value
                })}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Preferred Time</label>
              <select
                className="form-select"
                value={appointment.time}
                onChange={(e) => setAppointment({
                  ...appointment,
                  time: e.target.value
                })}
                required
              >
                <option value="">Select time</option>
                {timeSlots.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>

            <div className="col-12">
              <label className="form-label">Available Doctors</label>
              <div className="row g-2">
                {getAvailableDoctors().map(doctor => (
                  <div key={doctor.id} className="col-md-6">
                    <div 
                      className={`card p-3 cursor-pointer ${
                        appointment.doctorId === doctor.id ? 'border-primary' : ''
                      }`}
                      onClick={() => setAppointment({
                        ...appointment,
                        doctorId: doctor.id
                      })}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex align-items-center">
                        <div className="avatar me-3">
                          <div 
                            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                            style={{ width: '40px', height: '40px' }}
                          >
                            {doctor.name.charAt(0)}
                          </div>
                        </div>
                        <div>
                          <h6 className="mb-0">{doctor.name}</h6>
                          <small className="text-muted">{doctor.specialization}</small>
                          <br />
                          <small className="text-muted">Schedule: {doctor.schedule}</small>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-12">
              <label className="form-label">Additional Notes</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Any additional information"
                value={appointment.notes}
                onChange={(e) => setAppointment({
                  ...appointment,
                  notes: e.target.value
                })}
              ></textarea>
            </div>
          </div>

          <div className="mt-4">
            <button type="submit" className="btn btn-primary px-4" style={{ backgroundColor: '#E31937', borderColor: '#E31937' }}>
              Schedule Appointment
            </button>
            <button type="button" className="btn btn-outline-secondary px-4 ms-2">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentForm;

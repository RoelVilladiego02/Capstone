import React, { useState } from 'react';

const DoctorsSchedules = () => {
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const doctors = [
    { id: 1, name: 'Dr. John Smith', specialization: 'General Medicine', schedule: '9:00 AM - 5:00 PM' },
    { id: 2, name: 'Dr. Sarah Johnson', specialization: 'Pediatrics', schedule: '8:00 AM - 4:00 PM' },
    { id: 3, name: 'Dr. Michael Brown', specialization: 'Cardiology', schedule: '10:00 AM - 6:00 PM' }
  ];

  const appointments = [
    {
      id: 1,
      doctorId: 1,
      time: '09:00 AM',
      patientName: 'John Doe',
      concern: 'Fever and Headache',
      type: 'Walk-in',
      status: 'Waiting'
    },
    {
      id: 2,
      doctorId: 2,
      time: '10:00 AM',
      patientName: 'Jane Smith',
      concern: 'Regular Check-up',
      type: 'Online',
      status: 'Checked In'
    },
    {
      id: 3,
      doctorId: 3,
      time: '11:00 AM',
      patientName: 'Robert Brown',
      concern: 'Heart Consultation',
      type: 'Teleconsult',
      status: 'Scheduled'
    }
  ];

  const getTypeBadgeColor = (type) => {
    switch(type) {
      case 'Walk-in': return 'bg-primary';
      case 'Online': return 'bg-success';
      case 'Teleconsult': return 'bg-info';
      default: return 'bg-secondary';
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesDoctor = selectedDoctor === 'all' || apt.doctorId === parseInt(selectedDoctor);
    const matchesSearch = apt.patientName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDoctor && matchesSearch;
  });

  const handleViewDetails = (apt) => {
    setSelectedAppointment(apt);
    setShowModal(true);
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Doctor Schedules</h4>
          <p className="text-muted mb-0">View and manage all doctor appointments</p>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3">
          <div className="row g-3">
            <div className="col-md-3">
              <select 
                className="form-select"
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
              >
                <option value="all">All Doctors</option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.specialization}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <input
                type="date"
                className="form-control"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search patient..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Time</th>
                  <th>Doctor</th>
                  <th>Patient</th>
                  <th>Concern</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map(apt => {
                  const doctor = doctors.find(d => d.id === apt.doctorId);
                  return (
                    <tr key={apt.id}>
                      <td>{apt.time}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="avatar me-2">
                            <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" 
                                 style={{ width: '40px', height: '40px' }}>
                              {doctor?.name.charAt(3)}
                            </div>
                          </div>
                          <div>
                            <div className="fw-medium">{doctor?.name}</div>
                            <small className="text-muted">{doctor?.specialization}</small>
                          </div>
                        </div>
                      </td>
                      <td>{apt.patientName}</td>
                      <td>{apt.concern}</td>
                      <td>
                        <span className={`badge ${getTypeBadgeColor(apt.type)}`}>
                          {apt.type}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${
                          apt.status === 'Checked In' ? 'bg-success' :
                          apt.status === 'Waiting' ? 'bg-warning' :
                          'bg-primary'
                        }`}>
                          {apt.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => handleViewDetails(apt)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredAppointments.length === 0 && (
            <div className="text-center py-5">
              <i className="bi bi-calendar-x fs-1 text-muted"></i>
              <h5 className="mt-3">No appointments found</h5>
              <p className="text-muted">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Appointment Details Modal */}
      {showModal && selectedAppointment && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Appointment Details</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6 className="text-muted mb-3">Appointment Information</h6>
                    <p className="mb-1"><strong>Time:</strong> {selectedAppointment.time}</p>
                    <p className="mb-1"><strong>Patient:</strong> {selectedAppointment.patientName}</p>
                    <p className="mb-1"><strong>Concern:</strong> {selectedAppointment.concern}</p>
                    <p className="mb-1"><strong>Type:</strong> {selectedAppointment.type}</p>
                    <p className="mb-0">
                      <strong>Status:</strong> 
                      <span className={`badge ms-2 ${
                        selectedAppointment.status === 'Checked In' ? 'bg-success' :
                        selectedAppointment.status === 'Waiting' ? 'bg-warning' :
                        'bg-primary'
                      }`}>
                        {selectedAppointment.status}
                      </span>
                    </p>
                  </div>
                  <div className="col-md-6">
                    <h6 className="text-muted mb-3">Doctor Information</h6>
                    <p className="mb-1"><strong>Doctor:</strong> {doctors.find(d => d.id === selectedAppointment.doctorId)?.name}</p>
                    <p className="mb-1"><strong>Specialization:</strong> {doctors.find(d => d.id === selectedAppointment.doctorId)?.specialization}</p>
                    <p className="mb-0"><strong>Schedule:</strong> {doctors.find(d => d.id === selectedAppointment.doctorId)?.schedule}</p>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorsSchedules;

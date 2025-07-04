import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const AppointmentList = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const appointments = [
    {
      id: 1,
      patientName: 'John Doe',
      patientId: 'P001',
      doctor: 'Dr. Smith',
      date: '2024-02-15',
      time: '09:00',
      type: 'Walk-in',
      concern: 'Fever and Headache',
      status: 'Scheduled'
    },
    {
      id: 2,
      patientName: 'Jane Smith',
      patientId: 'P002',
      doctor: 'Dr. Johnson',
      date: '2024-02-15',
      time: '10:00',
      type: 'Online',
      concern: 'Regular Check-up',
      status: 'Confirmed'
    },
    {
      id: 3,
      patientName: 'Mike Wilson',
      patientId: 'P003',
      doctor: 'Dr. Brown',
      date: '2024-02-15',
      time: '11:00',
      type: 'Teleconsult',
      concern: 'Follow-up Consultation',
      status: 'Completed'
    }
  ];

  // Update getStatusBadgeClass to include new types
  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'Walk-in': return 'bg-primary';
      case 'Online': return 'bg-success';
      case 'Teleconsult': return 'bg-info';
      default: return 'bg-secondary';
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;
    const matchesSearch = apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-white py-3">
        <div className="row align-items-center">
          <div className="col">
            <h5 className="mb-0">Appointments</h5>
          </div>
          <div className="col-auto">
            <Link to="/appointments/new" className="btn btn-sm" style={{ backgroundColor: '#E31937', color: 'white' }}>
              <i className="bi bi-plus"></i> New Appointment
            </Link>
          </div>
        </div>
      </div>
      <div className="card-body">
        <div className="row mb-4 g-3">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3">
            <select 
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="No-show">No-show</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date & Time</th>
                <th>Concern</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map(apt => (
                <tr key={apt.id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="avatar me-2">
                        <div 
                          className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                          style={{ width: '40px', height: '40px' }}
                        >
                          {apt.patientName.charAt(0)}
                        </div>
                      </div>
                      <div>
                        <div className="fw-bold">{apt.patientName}</div>
                        <small className="text-muted">ID: {apt.patientId}</small>
                      </div>
                    </div>
                  </td>
                  <td>{apt.doctor}</td>
                  <td>
                    <div>{new Date(apt.date).toLocaleDateString()}</div>
                    <small className="text-muted">{apt.time}</small>
                  </td>
                  <td>{apt.concern}</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(apt.type)}`}>
                      {apt.type}
                    </span>
                  </td>
                  <td>
                    <div className="btn-group" role="group">
                      <button 
                        type="button" 
                        className="btn btn-sm" 
                        style={{ backgroundColor: '#E31937', color: 'white' }}
                      >
                        View
                      </button>
                      <button type="button" className="btn btn-sm btn-outline-secondary">
                        <i className="bi bi-three-dots-vertical"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAppointments.length === 0 && (
          <div className="text-center py-4">
            <div className="text-muted">No appointments found</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentList;

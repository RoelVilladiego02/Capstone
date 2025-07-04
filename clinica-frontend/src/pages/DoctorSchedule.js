import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const DoctorSchedule = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('Scheduled');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Mock appointments data - Added date field to all appointments
  const appointments = [
    {
      id: 1,
      date: selectedDate,
      time: "09:00 AM",
      patientName: "John Doe",
      age: 45,
      type: "Walk-in",
      concern: "Hypertension check",
      status: "Scheduled",
      lastVisit: "2024-01-15"
    },
    {
      id: 2,
      date: selectedDate,
      time: "09:30 AM",
      patientName: "Maria Garcia",
      age: 35,
      type: "Online",
      concern: "Persistent headache",
      status: "Completed",
      lastVisit: null
    },
    {
      id: 3,
      date: selectedDate,
      time: "10:00 AM",
      patientName: "Robert Wilson",
      age: 52,
      type: "Teleconsult",
      concern: "Diabetes monitoring",
      status: "Scheduled",
      lastVisit: "2024-02-01"
    },
    {
      id: 4,
      date: selectedDate,
      time: "10:30 AM",
      patientName: "Emily Brown",
      age: 28,
      type: "Online",
      concern: "Medication adjustment",
      status: "No-Show",
      lastVisit: "2024-01-20"
    },
    {
      id: 5,
      date: selectedDate,
      time: "11:00 AM",
      patientName: "James Smith",
      age: 60,
      type: "Online",
      concern: "Chest pain",
      status: "Completed",
      lastVisit: "2024-02-10"
    },
    {
      id: 6,
      date: selectedDate,
      time: "11:30 AM",
      patientName: "Sarah Johnson",
      age: 33,
      type: "Walk-in",
      concern: "Pregnancy check",
      status: "Scheduled",
      lastVisit: "2024-02-05"
    },
    {
      id: 7,
      date: selectedDate,
      time: "02:00 PM",
      patientName: "Michael Davis",
      age: 41,
      type: "Teleconsult",
      concern: "Back pain",
      status: "Cancelled",
      lastVisit: null
    },
    {
      id: 8,
      date: selectedDate,
      time: "02:30 PM",
      patientName: "Lisa Anderson",
      age: 39,
      type: "teleconsult",
      concern: "Thyroid check",
      status: "Scheduled",
      lastVisit: "2024-01-30"
    },
    {
      id: 9,
      date: selectedDate,
      time: "03:00 PM",
      patientName: "David Miller",
      age: 55,
      type: "Online",
      concern: "Cholesterol review",
      status: "Scheduled",
      lastVisit: "2024-02-08"
    },
    {
      id: 10,
      date: selectedDate,
      time: "03:30 PM",
      patientName: "Jennifer White",
      age: 31,
      type: "Online",
      concern: "Anxiety management",
      status: "Scheduled",
      lastVisit: "2024-02-01"
    },
    {
      id: 11,
      date: selectedDate,
      time: "04:00 PM",
      patientName: "Thomas Clark",
      age: 47,
      type: "Walk-in",
      concern: "Joint pain",
      status: "Scheduled",
      lastVisit: null
    },
    {
      id: 12,
      date: selectedDate,
      time: "04:30 PM",
      patientName: "Patricia Lee",
      age: 62,
      type: "Teleconsult",
      concern: "Blood pressure check",
      status: "Scheduled",
      lastVisit: "2024-02-07"
    }
  ];

  // Add currentUser to page title or filter
  React.useEffect(() => {
    document.title = `Schedule - Dr. ${currentUser?.fullName || 'Unknown'}`;
  }, [currentUser]);

  // Fix appointments useEffect
  const [appointmentsList, setAppointmentsList] = useState(appointments);

  React.useEffect(() => {
    setAppointmentsList(prev => 
      prev.map(apt => ({
        ...apt,
        date: selectedDate
      }))
    );
  }, [selectedDate]);

  // Update the filter to use appointmentsList instead of appointments
  const filteredAppointments = appointmentsList.filter(apt => {
    const matchesSearch = apt.patientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = activeTab === 'all' || apt.status === activeTab;
    return matchesSearch && matchesStatus;
  });

  // Update status counts to use appointmentsList
  const statusCounts = {
    Scheduled: appointmentsList.filter(apt => apt.status === 'Scheduled').length,
    Completed: appointmentsList.filter(apt => apt.status === 'Completed').length,
    Cancelled: appointmentsList.filter(apt => apt.status === 'Cancelled').length,
    'No-Show': appointmentsList.filter(apt => apt.status === 'No-Show').length
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'Scheduled': return 'primary';
      case 'Completed': return 'success';
      case 'Cancelled': return 'danger';
      case 'No-Show': return 'warning';
      default: return 'secondary';
    }
  };

  // Add function to get type badge color
  const getTypeBadgeColor = (type) => {
    switch(type) {
      case 'Walk-in': return 'bg-primary';
      case 'Online': return 'bg-success';
      case 'Teleconsult': return 'bg-info';
      default: return 'bg-secondary';
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status} className="col-md-3">
            <div className={`card border-0 shadow-sm ${activeTab === status ? 'border-start border-4 border-primary' : ''}`}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-2">{status}</h6>
                    <h3 className="mb-0">{count}</h3>
                  </div>
                  <div className={`bg-${getStatusBadgeColor(status)}-subtle p-3 rounded-circle`}>
                    <i className={`bi bi-${
                      status === 'Scheduled' ? 'calendar-check' :
                      status === 'Completed' ? 'check-circle' :
                      status === 'Cancelled' ? 'x-circle' : 'exclamation-circle'
                    } text-${getStatusBadgeColor(status)} fs-4`}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Header - Remove Add Appointment button for doctors */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Doctor's Schedule</h4>
          <p className="text-muted mb-0">Manage your appointments for {new Date(selectedDate).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Filters - Simplified for view-only */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3">
          <div className="row g-3">
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
            <div className="col-md-3">
              <input
                type="date"
                className="form-control"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>

          <ul className="nav nav-tabs card-header-tabs mt-3">
            {['Scheduled', 'Completed', 'Cancelled', 'No-Show', 'all'].map(status => (
              <li className="nav-item" key={status}>
                <button
                  className={`nav-link ${activeTab === status ? 'active' : ''}`}
                  onClick={() => setActiveTab(status)}
                >
                  {status === 'all' ? 'All' : status}
                  {status !== 'all' && (
                    <span className="ms-2 badge bg-secondary rounded-pill">
                      {statusCounts[status] || 0}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Time</th>
                  <th>Patient</th>
                  <th>Age</th>
                  <th>Type</th>
                  <th>Concern</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map(appointment => (
                    <tr key={appointment.id}>
                      <td>{appointment.time}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="avatar avatar-circle me-2 bg-primary-subtle text-primary">
                            {appointment.patientName.substring(0, 2)}
                          </div>
                          <div>
                            <p className="mb-0 fw-medium">{appointment.patientName}</p>
                            {appointment.lastVisit && (
                              <small className="text-muted">Last visit: {new Date(appointment.lastVisit).toLocaleDateString()}</small>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{appointment.age}</td>
                      <td>
                        <span className={`badge ${getTypeBadgeColor(appointment.type)}`}>
                          {appointment.type}
                        </span>
                      </td>
                      <td>{appointment.concern}</td>
                      <td>
                        <span className={`badge bg-${getStatusBadgeColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group">
                          <button className="btn btn-sm btn-outline-primary">
                            <i className="bi bi-eye me-1"></i>View
                          </button>
                          {appointment.status === 'Scheduled' && (
                            <button 
                              className="btn btn-sm" 
                              style={{ backgroundColor: '#E31937', color: 'white' }}
                            >
                              <i className="bi bi-check-circle me-1"></i>Complete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      <div className="py-5">
                        <i className="bi bi-calendar-x fs-1 text-muted"></i>
                        <h5 className="mt-3">No appointments found</h5>
                        <p className="text-muted">Try changing your filters or select a different date</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSchedule;
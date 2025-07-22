import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { appointmentService } from '../services/appointmentService';

const DoctorSchedule = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('Scheduled');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [appointmentsList, setAppointmentsList] = useState([]);
  const [statusCounts, setStatusCounts] = useState({
    Scheduled: 0,
    Completed: 0,
    Cancelled: 0,
    'No-Show': 0
  });

  // Fetch appointments data
  const fetchAppointments = useCallback(async () => {
    if (!currentUser?.id) return;
    
    setLoading(true);
    try {
      const appointments = await appointmentService.getDoctorAppointments(currentUser.id, {
        date: selectedDate
      });
      
      setAppointmentsList(appointments);

      // Update status counts
      const counts = {
        Scheduled: 0,
        Completed: 0,
        Cancelled: 0,
        'No-Show': 0
      };
      
      appointments.forEach(apt => {
        if (counts.hasOwnProperty(apt.status)) {
          counts[apt.status]++;
        }
      });
      
      setStatusCounts(counts);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, selectedDate]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Add currentUser to page title
  useEffect(() => {
    document.title = `Schedule - Dr. ${currentUser?.name || 'Unknown'}`;
  }, [currentUser]);

  // Filter appointments
  const filteredAppointments = appointmentsList.filter(apt => {
    const matchesSearch = apt.patient?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = activeTab === 'all' || apt.status === activeTab;
    return matchesSearch && matchesStatus;
  });

  // Handle appointment completion
  const handleCompleteAppointment = async (appointmentId) => {
    try {
      await appointmentService.updateAppointment(appointmentId, {
        status: 'Completed'
      });
      // Refresh appointments after update
      fetchAppointments();
    } catch (error) {
      console.error('Error completing appointment:', error);
    }
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

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

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
                            {appointment.patient?.charAt(0)}
                          </div>
                          <div>
                            <p className="mb-0 fw-medium">{appointment.patient}</p>
                          </div>
                        </div>
                      </td>
                      <td>{appointment.patient_id}</td>
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
                              onClick={() => handleCompleteAppointment(appointment.id)}
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
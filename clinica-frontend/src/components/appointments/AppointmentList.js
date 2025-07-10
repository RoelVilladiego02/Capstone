import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { appointmentService } from '../../services/appointmentService';

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState('');

  // Get current user info
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      setError('');
      let appointmentsData = [];
      try {
        const role = currentUser.role || 'patient';
        setUserRole(role);

        if (role === 'patient') {
          // Always get patient id from /patients/me or fallback to currentUser.id
          let pid = null;
          try {
            const patientResponse = await api.get('/patients/me');
            pid = patientResponse.patient?.id || patientResponse.id;
          } catch {
            // fallback to currentUser.id
            pid = currentUser.id;
          }

          if (pid) {
            appointmentsData = await appointmentService.getAppointments({ patient_id: pid });
          }
        } else if (role === 'doctor') {
          appointmentsData = await appointmentService.getAppointments({ doctor_id: currentUser.id });
        } else {
          appointmentsData = await appointmentService.getAppointments();
        }

        if (!Array.isArray(appointmentsData)) {
          appointmentsData = [];
        }

        // Enrich appointments with patient/doctor names
        const enrichedAppointments = await Promise.all(
          appointmentsData.map(async (apt) => {
            let patientName = apt.patient?.name || apt.patient?.user?.name;
            if (!patientName && apt.patient_id) {
              try {
                const patientData = await api.get(`/patients/${apt.patient_id}`);
                patientName = patientData.user?.name || patientData.name || `Patient ${apt.patient_id}`;
              } catch {
                patientName = `Patient ${apt.patient_id}`;
              }
            }
            let doctorName = apt.doctor?.name || apt.doctor?.user?.name;
            if (!doctorName && apt.doctor_id) {
              try {
                const doctorData = await api.get(`/users/${apt.doctor_id}`);
                doctorName = doctorData.name || `Doctor ${apt.doctor_id}`;
              } catch {
                doctorName = `Doctor ${apt.doctor_id}`;
              }
            }
            return {
              ...apt,
              patientName: patientName || 'Unknown Patient',
              doctorName: doctorName || 'Unknown Doctor'
            };
          })
        );

        setAppointments(enrichedAppointments);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError(err.message || 'Failed to fetch appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
    // Only re-run if user changes
  }, [currentUser.id, currentUser.role]);

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'Scheduled': return 'bg-primary';
      case 'Confirmed': return 'bg-success';
      case 'Completed': return 'bg-info';
      case 'Cancelled': return 'bg-danger';
      case 'No-show': return 'bg-warning';
      case 'Checked In': return 'bg-success';
      default: return 'bg-secondary';
    }
  };

  const getTypeBadgeClass = (type) => {
    switch(type) {
      case 'Walk-in': return 'bg-primary';
      case 'Online': return 'bg-success';
      case 'Teleconsultation': return 'bg-info';
      default: return 'bg-secondary';
    }
  };

  // For patients, only show their own appointments (already filtered by API)
  // For others, show all fetched appointments
  const filteredAppointments = appointments.filter(apt => {
    const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;
    const matchesSearch = searchTerm === '' ||
      (apt.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.concern?.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }
    try {
      await appointmentService.updateAppointment(appointmentId, { status: 'Cancelled' });
      setAppointments(appointments.map(apt =>
        apt.id === appointmentId ? { ...apt, status: 'Cancelled' } : apt
      ));
    } catch (err) {
      console.error('Error canceling appointment:', err);
      
      // Handle specific validation errors from backend
      if (err.response?.data?.errors) {
        const validationErrors = err.response.data.errors;
        const errorMessages = Object.values(validationErrors).flat();
        alert(`Failed to cancel appointment: ${errorMessages.join('. ')}`);
      } else {
        alert('Failed to cancel appointment. Please try again.');
      }
    }
  };

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-white py-3">
        <div className="row align-items-center">
          <div className="col">
            <h5 className="mb-0">
              My Appointments
              {appointments.length > 0 && (
                <span className="badge bg-primary ms-2">{appointments.length}</span>
              )}
            </h5>
          </div>
          <div className="col-auto">
            <Link to="/appointments/new" className="btn btn-sm" style={{ backgroundColor: '#E31937', color: 'white' }}>
              <i className="bi bi-plus"></i> New Appointment
            </Link>
          </div>
        </div>
      </div>
      
      <div className="card-body">
        {loading && (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading appointments...</p>
          </div>
        )}
        
        {error && (
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}
        
        {!loading && !error && (
          <>
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
                  <option value="Checked In">Checked In</option>
                </select>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    {userRole !== 'patient' && <th>Patient</th>}
                    {userRole !== 'doctor' && <th>Doctor</th>}
                    <th>Date & Time</th>
                    <th>Concern</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map(apt => (
                    <tr key={apt.id}>
                      {userRole !== 'patient' && (
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="avatar me-2">
                              <div 
                                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                                style={{ width: '40px', height: '40px' }}
                              >
                                {apt.patientName?.charAt(0) || '?'}
                              </div>
                            </div>
                            <div>
                              <div className="fw-bold">{apt.patientName}</div>
                              <small className="text-muted">ID: {apt.patient_id}</small>
                            </div>
                          </div>
                        </td>
                      )}
                      {userRole !== 'doctor' && (
                        <td>
                          <div className="fw-bold">{apt.doctorName}</div>
                          <small className="text-muted">ID: {apt.doctor_id}</small>
                        </td>
                      )}
                      <td>
                        <div className="fw-bold">{apt.date ? new Date(apt.date).toLocaleDateString() : 'N/A'}</div>
                        <small className="text-muted">{apt.time || 'No time set'}</small>
                      </td>
                      <td>
                        <div className="text-truncate" style={{ maxWidth: '200px' }}>
                          {apt.concern || 'No concern specified'}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${getTypeBadgeClass(apt.type)}`}>
                          {apt.type || 'Walk-in'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(apt.status)}`}>
                          {apt.status || 'Scheduled'}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          <button 
                            type="button" 
                            className="btn btn-sm btn-outline-primary"
                            title="View Details"
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          {apt.status !== 'Completed' && apt.status !== 'Cancelled' && (
                            <button 
                              type="button" 
                              className="btn btn-sm btn-outline-secondary"
                              title="Edit"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                          )}
                          {apt.status !== 'Completed' && apt.status !== 'Cancelled' && (
                            <button 
                              type="button" 
                              className="btn btn-sm btn-outline-danger"
                              title="Cancel"
                              onClick={() => handleCancelAppointment(apt.id)}
                            >
                              <i className="bi bi-x"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredAppointments.length === 0 && (
              <div className="text-center py-4">
                <i className="bi bi-calendar-x fs-1 text-muted"></i>
                <div className="text-muted mt-2">
                  {searchTerm || filterStatus !== 'all' ? 'No appointments match your search criteria' : 'No appointments found'}
                </div>
                {!searchTerm && filterStatus === 'all' && (
                  <Link to="/appointments/new" className="btn btn-outline-primary mt-3">
                    Schedule Your First Appointment
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AppointmentList;
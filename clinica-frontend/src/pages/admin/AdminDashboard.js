import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { Link } from 'react-router-dom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Patient visits data
  const patientVisitsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Patient Visits',
      data: [45, 39, 53, 47, 54, 48],
      borderColor: '#E31937',
      backgroundColor: 'rgba(227, 25, 55, 0.1)',
      tension: 0.3,
      fill: true
    }]
  };

  const patientVisitsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Patient Visits',
        color: '#333',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Visits'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Month'
        }
      }
    }
  };

  // Appointment types distribution
  const appointmentTypesData = {
    labels: ['Check-up', 'Follow-up', 'Consultation', 'Procedure', 'Emergency'],
    datasets: [{
      data: [35, 25, 22, 15, 3],
      backgroundColor: [
        '#E31937',
        '#FF6384',
        '#FF9F40',
        '#36A2EB',
        '#4BC0C0'
      ],
      borderWidth: 1
    }]
  };

  const appointmentTypesOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      title: {
        display: true,
        text: 'Appointment Types',
        color: '#333',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    }
  };

  // Today's appointments
  const todaysAppointments = [
    { id: 1, time: '9:00 AM', patient: 'John Doe', type: 'Follow-up', status: 'Checked In', image: 'https://via.placeholder.com/150' },
    { id: 2, time: '10:30 AM', patient: 'Jane Smith', type: 'Consultation', status: 'Scheduled', image: 'https://via.placeholder.com/150' },
    { id: 3, time: '1:00 PM', patient: 'Robert Johnson', type: 'Check-up', status: 'Scheduled', image: 'https://via.placeholder.com/150' },
    { id: 4, time: '2:30 PM', patient: 'Emily Davis', type: 'Procedure', status: 'Confirmed', image: 'https://via.placeholder.com/150' },
    { id: 5, time: '4:00 PM', patient: 'Michael Wilson', type: 'Follow-up', status: 'Scheduled', image: 'https://via.placeholder.com/150' }
  ];

  // Recent patients who need follow-up
  const needFollowUp = [
    { id: 1, patient: 'Sarah Johnson', lastVisit: '2025-04-20', reason: 'Post-surgery check', image: 'https://via.placeholder.com/150' },
    { id: 2, patient: 'Thomas Brown', lastVisit: '2025-04-19', reason: 'Test results review', image: 'https://via.placeholder.com/150' }
  ];

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'Checked In':
        return 'bg-success';
      case 'Confirmed':
        return 'bg-primary';
      case 'Scheduled':
        return 'bg-warning text-dark';
      default:
        return 'bg-secondary';
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentModal(true);
  };

  return (
    <div className="container-fluid py-4 bg-light">
      {/* Page header */}
      <div className="row mb-4">
        <div className="col-12">
          <h2 className="fw-bold mb-0">Admin Dashboard</h2>
          <p className="text-muted">Welcome back, Admin</p>
        </div>
      </div>

      {/* Welcome and summary section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm rounded-3 overflow-hidden" style={{ borderLeft: '4px solid #E31937' }}>
            <div className="card-body p-4">
              <div className="row align-items-center">
                <div className="col-auto">
                  <div className="rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(227, 25, 55, 0.1)', width: '60px', height: '60px' }}>
                    <i className="bi bi-calendar-check fs-3 text-danger"></i>
                  </div>
                </div>
                <div className="col">
                  <h4 className="mb-1 fw-bold">Today's Schedule</h4>
                  <p className="text-muted mb-0">You have 5 appointments scheduled for today</p>
                </div>
                <div className="col-auto">
                  <Link to="/doctor-schedules" className="btn btn-danger rounded-pill px-4">
                    <i className="bi bi-calendar2-week me-2"></i>
                    View All Appointments
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats summary */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-3 h-100 overflow-hidden">
            <div className="card-body position-relative p-4">
              <div className="position-absolute top-0 end-0 mt-3 me-3 rounded-circle p-2" 
                   style={{ backgroundColor: 'rgba(227, 25, 55, 0.1)' }}>
                <i className="bi bi-people fs-4 text-danger"></i>
              </div>
              <p className="text-muted fw-light mb-1">Today's Patients</p>
              <h2 className="display-6 fw-bold mb-0">5</h2>
              <div className="text-success small mt-2">
                <i className="bi bi-arrow-up-short"></i> 2 from yesterday
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-3 h-100 overflow-hidden">
            <div className="card-body position-relative p-4">
              <div className="position-absolute top-0 end-0 mt-3 me-3 rounded-circle p-2" 
                   style={{ backgroundColor: 'rgba(227, 25, 55, 0.1)' }}>
                <i className="bi bi-person-plus fs-4 text-danger"></i>
              </div>
              <p className="text-muted fw-light mb-1">New Patients</p>
              <h2 className="display-6 fw-bold mb-0">2</h2>
              <div className="text-success small mt-2">
                <i className="bi bi-arrow-up-short"></i> 1 from yesterday
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-3 h-100 overflow-hidden">
            <div className="card-body position-relative p-4">
              <div className="position-absolute top-0 end-0 mt-3 me-3 rounded-circle p-2" 
                   style={{ backgroundColor: 'rgba(227, 25, 55, 0.1)' }}>
                <i className="bi bi-clipboard-data fs-4 text-danger"></i>
              </div>
              <p className="text-muted fw-light mb-1">Pending Reports</p>
              <h2 className="display-6 fw-bold mb-0">3</h2>
              <div className="text-warning small mt-2">
                <i className="bi bi-clock"></i> Requires attention
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-3 h-100 overflow-hidden">
            <div className="card-body position-relative p-4">
              <div className="position-absolute top-0 end-0 mt-3 me-3 rounded-circle p-2" 
                   style={{ backgroundColor: 'rgba(227, 25, 55, 0.1)' }}>
                <i className="bi bi-camera-video fs-4 text-danger"></i>
              </div>
              <p className="text-muted fw-light mb-1">Teleconsults</p>
              <h2 className="display-6 fw-bold mb-0">1</h2>
              <div className="text-info small mt-2">
                <i className="bi bi-calendar-event"></i> Today at 11:30 AM
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and appointments */}
      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-header bg-white border-0 py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="card-title fw-bold mb-0">
                  <i className="bi bi-calendar2-week me-2 text-danger"></i>
                  Today's Appointments
                </h5>
                <div>
                  <button className="btn btn-sm btn-outline-secondary rounded-pill me-2">
                    <i className="bi bi-filter me-1"></i>Filter
                  </button>
                  <button className="btn btn-sm btn-outline-secondary rounded-pill">
                    <i className="bi bi-download me-1"></i>Export
                  </button>
                </div>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="ps-4">Time</th>
                      <th>Patient</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th className="text-end pe-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todaysAppointments.map(appointment => (
                      <tr key={appointment.id}>
                        <td className="ps-4">
                          <div className="d-flex align-items-center">
                            <div className="me-3">
                              <i className="bi bi-clock text-muted"></i>
                            </div>
                            <span className="fw-medium">{appointment.time}</span>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="avatar-circle me-2 d-flex align-items-center justify-content-center" 
                                 style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(227, 25, 55, 0.1)', color: '#E31937' }}>
                              {getInitials(appointment.patient)}
                            </div>
                            <span>{appointment.patient}</span>
                          </div>
                        </td>
                        <td>
                          <span className="text-muted">{appointment.type}</span>
                        </td>
                        <td>
                          <span className={`badge rounded-pill px-3 py-2 ${getStatusBadgeClass(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </td>
                        <td className="text-end pe-4">
                          <button 
                            type="button" 
                            className="btn btn-sm btn-outline-primary rounded-pill px-3"
                            onClick={() => handleViewAppointment(appointment)}
                          >
                            <i className="bi bi-eye me-1"></i> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="card-title fw-bold mb-0">
                <i className="bi bi-pie-chart-fill me-2 text-danger"></i>
                Appointment Distribution
              </h5>
            </div>
            <div className="card-body">
              <div style={{ height: '300px' }}>
                <Doughnut data={appointmentTypesData} options={appointmentTypesOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Patient visits chart and follow-ups */}
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-header bg-white border-0 py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="card-title fw-bold mb-0">
                  <i className="bi bi-graph-up me-2 text-danger"></i>
                  Patient Visits Trend
                </h5>
                <div className="btn-group">
                  <button className="btn btn-sm btn-outline-secondary active">Monthly</button>
                  <button className="btn btn-sm btn-outline-secondary">Quarterly</button>
                  <button className="btn btn-sm btn-outline-secondary">Yearly</button>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div style={{ height: '300px' }}>
                <Line data={patientVisitsData} options={patientVisitsOptions} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="card-title fw-bold mb-0">
                <i className="bi bi-calendar-check me-2 text-danger"></i>
                Patients Needing Follow-up
              </h5>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                {needFollowUp.map(patient => (
                  <div key={patient.id} className="list-group-item border-0 px-4 py-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <div className="avatar-circle me-3 d-flex align-items-center justify-content-center" 
                             style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: 'rgba(227, 25, 55, 0.1)', color: '#E31937' }}>
                          {getInitials(patient.patient)}
                        </div>
                        <div>
                          <h6 className="mb-1 fw-semibold">{patient.patient}</h6>
                          <p className="mb-1 small text-muted">
                            <i className="bi bi-calendar3 me-1"></i>
                            {new Date(patient.lastVisit).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                          <p className="mb-0 small text-secondary">
                            <i className="bi bi-info-circle me-1"></i>
                            {patient.reason}
                          </p>
                        </div>
                      </div>
                      <button 
                        className="btn btn-sm btn-danger rounded-pill px-3"
                      >
                        <i className="bi bi-telephone me-1"></i>
                        Contact
                      </button>
                    </div>
                  </div>
                ))}
                {needFollowUp.length > 0 && (
                  <div className="text-center py-3 border-top">
                    <button type="button" className="btn btn-link" /* onClick={...} */>
                      View all follow-ups
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment modal */}
      {showAppointmentModal && selectedAppointment && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">
                  <i className="bi bi-calendar2-check me-2"></i>
                  Appointment Details
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowAppointmentModal(false)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="p-3 border rounded-3 bg-light h-100">
                      <h6 className="mb-3 border-bottom pb-2 fw-bold">
                        <i className="bi bi-person me-2 text-danger"></i>
                        Patient Information
                      </h6>
                      <div className="d-flex align-items-center mb-4">
                        <div className="avatar-circle me-3 d-flex align-items-center justify-content-center" 
                             style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'rgba(227, 25, 55, 0.1)', color: '#E31937' }}>
                          {getInitials(selectedAppointment.patient)}
                        </div>
                        <div>
                          <h5 className="mb-0 fw-bold">{selectedAppointment.patient}</h5>
                          <p className="mb-0 text-muted small">Patient ID: PT-{Math.floor(Math.random() * 10000)}</p>
                        </div>
                      </div>
                      <div className="mb-3">
                        <p className="small text-muted mb-1">Appointment Time</p>
                        <p className="mb-0 fw-medium">
                          <i className="bi bi-clock me-1 text-danger"></i>
                          {selectedAppointment.time}
                        </p>
                      </div>
                      <div className="mb-3">
                        <p className="small text-muted mb-1">Appointment Type</p>
                        <p className="mb-0 fw-medium">
                          <i className="bi bi-journal-medical me-1 text-danger"></i>
                          {selectedAppointment.type}
                        </p>
                      </div>
                      <div>
                        <p className="small text-muted mb-1">Status</p>
                        <span className={`badge ${getStatusBadgeClass(selectedAppointment.status)} rounded-pill px-3 py-2`}>
                          {selectedAppointment.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 border rounded-3 bg-light h-100">
                      <h6 className="mb-3 border-bottom pb-2 fw-bold">
                        <i className="bi bi-info-circle me-2 text-danger"></i>
                        Additional Information
                      </h6>
                      <div className="mb-3">
                        <p className="small text-muted mb-1">Doctor</p>
                        <p className="mb-0 fw-medium">
                          <i className="bi bi-person-badge me-1 text-danger"></i>
                          Dr. Smith
                        </p>
                      </div>
                      <div className="mb-3">
                        <p className="small text-muted mb-1">Department</p>
                        <p className="mb-0 fw-medium">
                          <i className="bi bi-building me-1 text-danger"></i>
                          General Medicine
                        </p>
                      </div>
                      <div className="mb-3">
                        <p className="small text-muted mb-1">Room</p>
                        <p className="mb-0 fw-medium">
                          <i className="bi bi-door-closed me-1 text-danger"></i>
                          101
                        </p>
                      </div>
                      <div>
                        <p className="small text-muted mb-1">Notes</p>
                        <p className="mb-0 fw-medium">
                          <i className="bi bi-journal-text me-1 text-danger"></i>
                          Regular check-up appointment
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-top">
                <div className="w-100 d-flex justify-content-between">
                  <div>
                    <button className="btn btn-outline-secondary rounded-pill px-3 me-2">
                      <i className="bi bi-printer me-1"></i>
                      Print Details
                    </button>
                  </div>
                  <div>
                    <button 
                      type="button" 
                      className="btn btn-secondary rounded-pill px-3 me-2"
                      onClick={() => setShowAppointmentModal(false)}
                    >
                      Close
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-danger rounded-pill px-3"
                    >
                      <i className="bi bi-pencil-square me-1"></i>
                      Edit Appointment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
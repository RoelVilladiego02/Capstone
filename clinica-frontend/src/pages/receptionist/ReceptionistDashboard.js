import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ReceptionistDashboard = () => {
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Mock data for today's appointments
  const todaysAppointments = [
    { 
      id: 1, 
      time: '9:00 AM', 
      patient: 'John Doe', 
      doctor: 'Dr. Smith', 
      concern: 'Fever and Headache',
      type: 'Walk-in',
      status: 'Waiting' 
    },
    { 
      id: 2, 
      time: '9:30 AM', 
      patient: 'Jane Smith', 
      doctor: 'Dr. Johnson', 
      concern: 'Regular Check-up',
      type: 'Online',
      status: 'Checked In' 
    },
    { 
      id: 3, 
      time: '10:00 AM', 
      patient: 'Robert Brown', 
      doctor: 'Dr. Wilson', 
      concern: 'Follow-up Consultation',
      type: 'Teleconsult',
      status: 'Scheduled' 
    }
  ];

  // Hourly check-ins data
  const checkInsData = {
    labels: ['8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM'],
    datasets: [{
      label: 'Patient Check-ins',
      data: [2, 4, 3, 5, 2, 3, 4, 1],
      borderColor: '#E31937',
      backgroundColor: 'rgba(227, 25, 55, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  const handleCheckIn = (appointment) => {
    setSelectedAppointment(appointment);
    setShowCheckInModal(true);
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#333',
        bodyColor: '#333',
        borderColor: '#e0e0e0',
        borderWidth: 1,
        padding: 10,
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        cornerRadius: 6
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        beginAtZero: true
      }
    }
  };

  return (
    <div className="container-fluid py-4 px-4 bg-light">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <h4 className="fw-bold mb-0">Receptionist Dashboard</h4>
          <p className="text-muted">Welcome back, Monday, April 28, 2025</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-3 h-100 hover-shadow transition-all">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted fw-light mb-2">Today's Appointments</h6>
                  <h2 className="mb-0 fw-bold">12</h2>
                </div>
                <div className="rounded-circle p-3" style={{ backgroundColor: 'rgba(227, 25, 55, 0.1)' }}>
                  <i className="bi bi-calendar-check" style={{ fontSize: '1.5rem', color: '#E31937' }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-3 h-100 hover-shadow transition-all">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted fw-light mb-2">Checked In</h6>
                  <h2 className="mb-0 fw-bold">5</h2>
                </div>
                <div className="rounded-circle p-3" style={{ backgroundColor: 'rgba(227, 25, 55, 0.1)' }}>
                  <i className="bi bi-person-check" style={{ fontSize: '1.5rem', color: '#E31937' }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-3 h-100 hover-shadow transition-all">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted fw-light mb-2">Waiting</h6>
                  <h2 className="mb-0 fw-bold">3</h2>
                </div>
                <div className="rounded-circle p-3" style={{ backgroundColor: 'rgba(227, 25, 55, 0.1)' }}>
                  <i className="bi bi-hourglass-split" style={{ fontSize: '1.5rem', color: '#E31937' }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-3 h-100 hover-shadow transition-all">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted fw-light mb-2">New Patients</h6>
                  <h2 className="mb-0 fw-bold">2</h2>
                </div>
                <div className="rounded-circle p-3" style={{ backgroundColor: 'rgba(227, 25, 55, 0.1)' }}>
                  <i className="bi bi-person-plus" style={{ fontSize: '1.5rem', color: '#E31937' }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        {/* Appointments Table */}
        <div className="col-lg-8 mb-4 mb-lg-0">
          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="card-title fw-bold mb-0">Today's Schedule</h5>
                <Link to="/appointments/new" className="btn btn-sm btn-primary" style={{ 
                  backgroundColor: '#E31937', 
                  color: 'white', 
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  boxShadow: '0 2px 4px rgba(227, 25, 55, 0.25)'
                }}>
                  <i className="bi bi-plus-circle me-2"></i>New Appointment
                </Link>
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr className="table-light">
                      <th className="ps-3 py-3">Time</th>
                      <th className="py-3">Patient</th>
                      <th className="py-3">Doctor</th>
                      <th className="py-3">Concern</th>
                      <th className="py-3">Type</th>
                      <th className="py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todaysAppointments.map(apt => (
                      <tr key={apt.id} className="border-bottom">
                        <td className="ps-3 py-3 fw-medium">{apt.time}</td>
                        <td className="py-3">{apt.patient}</td>
                        <td className="py-3">{apt.doctor}</td>
                        <td className="py-3">{apt.concern}</td>
                        <td className="py-3">
                          <span className={`badge rounded-pill ${
                            apt.type === 'Walk-in' ? 'bg-primary' :
                            apt.type === 'Online' ? 'bg-success' :
                            'bg-info'  // for Teleconsult
                          }`} style={{ fontSize: '0.75rem', padding: '5px 10px' }}>
                            {apt.type === 'Walk-in' && <i className="bi bi-person-fill me-1"></i>}
                            {apt.type === 'Online' && <i className="bi bi-laptop me-1"></i>}
                            {apt.type === 'Teleconsult' && <i className="bi bi-camera-video me-1"></i>}
                            {apt.type}
                          </span>
                        </td>
                        <td className="py-3">
                          <button 
                            className="btn btn-sm me-2" 
                            style={{ 
                              backgroundColor: apt.status === 'Checked In' ? '#6c757d' : '#E31937',
                              color: 'white',
                              borderRadius: '6px',
                              padding: '6px 12px',
                              border: 'none'
                            }}
                            onClick={() => handleCheckIn(apt)}
                            disabled={apt.status === 'Checked In'}
                          >
                            {apt.status === 'Checked In' ? (
                              <><i className="bi bi-check2-circle me-1"></i>Checked In</>
                            ) : (
                              <><i className="bi bi-box-arrow-in-right me-1"></i>Check In</>
                            )}
                          </button>
                          <button className="btn btn-sm btn-outline-secondary" style={{ borderRadius: '6px' }}>
                            <i className="bi bi-three-dots me-1"></i>Details
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

        {/* Right Column */}
        <div className="col-lg-4">
          {/* Quick Actions */}
          <div className="card border-0 shadow-sm rounded-3 mb-4">
            <div className="card-body p-4">
              <h5 className="card-title fw-bold mb-4">Quick Actions</h5>
              <div className="d-grid gap-3">
                <Link to="/patients/register" className="btn btn-outline-primary d-flex align-items-center justify-content-center" style={{ 
                  borderRadius: '8px',
                  padding: '10px',
                  borderWidth: '1.5px',
                  transition: 'all 0.2s'
                }}>
                  <i className="bi bi-person-plus me-2" style={{ fontSize: '1.1rem' }}></i>
                  <span>Register New Patient</span>
                </Link>
                <Link to="/billing" className="btn btn-outline-primary d-flex align-items-center justify-content-center" style={{ 
                  borderRadius: '8px',
                  padding: '10px',
                  borderWidth: '1.5px',
                  transition: 'all 0.2s'
                }}>
                  <i className="bi bi-receipt me-2" style={{ fontSize: '1.1rem' }}></i>
                  <span>Process Payment</span>
                </Link>
                <Link to="/schedule" className="btn btn-outline-primary d-flex align-items-center justify-content-center" style={{ 
                  borderRadius: '8px',
                  padding: '10px',
                  borderWidth: '1.5px',
                  transition: 'all 0.2s'
                }}>
                  <i className="bi bi-calendar-week me-2" style={{ fontSize: '1.1rem' }}></i>
                  <span>View Schedule</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Check-ins Chart */}
          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-body p-4">
              <h5 className="card-title fw-bold mb-4">Today's Check-ins</h5>
              <div style={{ height: '240px' }}>
                <Line 
                  data={checkInsData}
                  options={chartOptions}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Check-in Modal */}
      {showCheckInModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow" style={{ borderRadius: '12px' }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Check In Patient</h5>
                <button type="button" className="btn-close" onClick={() => setShowCheckInModal(false)}></button>
              </div>
              <div className="modal-body px-4">
                <div className="card border-0 bg-light mb-4 rounded-3">
                  <div className="card-body p-3">
                    <div className="d-flex align-items-center mb-2">
                      <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center me-3" 
                           style={{ width: '38px', height: '38px', backgroundColor: 'rgba(227, 25, 55, 0.1)' }}>
                        <i className="bi bi-person" style={{ fontSize: '1.2rem', color: '#E31937' }}></i>
                      </div>
                      <h6 className="mb-0 fw-bold">{selectedAppointment.patient}</h6>
                    </div>
                    <div className="ps-5">
                      <div className="d-flex align-items-center text-muted small">
                        <i className="bi bi-clock me-2"></i>
                        <span>{selectedAppointment.time} with {selectedAppointment.doctor}</span>
                      </div>
                      <div className="d-flex align-items-center text-muted small mt-1">
                        <i className="bi bi-clipboard-plus me-2"></i>
                        <span>{selectedAppointment.concern}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="form-label fw-medium">Payment Method</label>
                  <select className="form-select form-select-lg" style={{ borderRadius: '8px', padding: '12px 15px', fontSize: '1rem' }}>
                    <option value="">Select payment method</option>
                    <option value="cash">Cash</option>
                    <option value="credit">Credit Card</option>
                    <option value="gcash">GCash</option>
                    <option value="paymaya">PayMaya</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="form-label fw-medium">Consultation Fee</label>
                  <div className="input-group">
                    <span className="input-group-text" style={{ backgroundColor: '#f8f9fa', borderRight: 'none' }}>₱</span>
                    <input type="number" className="form-control form-control-lg" defaultValue="500" style={{ borderRadius: '0 8px 8px 0', padding: '12px 15px', fontSize: '1rem' }} />
                  </div>
                </div>
                <div className="form-check mb-3">
                  <input className="form-check-input" type="checkbox" id="verifyPayment" style={{ width: '20px', height: '20px' }} />
                  <label className="form-check-label ps-2 fw-medium" htmlFor="verifyPayment">
                    Payment Received
                  </label>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary" 
                  onClick={() => setShowCheckInModal(false)} 
                  style={{ borderRadius: '8px', padding: '10px 20px' }}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  style={{ 
                    backgroundColor: '#E31937', 
                    borderColor: '#E31937', 
                    borderRadius: '8px', 
                    padding: '10px 20px',
                    boxShadow: '0 2px 4px rgba(227, 25, 55, 0.25)'
                  }}
                >
                  <i className="bi bi-check2 me-2"></i>Complete Check-in
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add custom CSS */}
      <style jsx>{`
        .hover-shadow:hover {
          transform: translateY(-3px);
          box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;
        }
        .transition-all {
          transition: all 0.3s ease;
        }
        .btn-outline-primary {
          border-color: #E31937;
          color: #E31937;
        }
        .btn-outline-primary:hover {
          background-color: #E31937;
          color: white;
          border-color: #E31937;
        }
        .btn-primary {
          background-color: #E31937;
          border-color: #E31937;
        }
        .btn-primary:hover {
          background-color: #c31730;
          border-color: #c31730;
        }
      `}</style>
    </div>
  );
};

export default ReceptionistDashboard;
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { api } from '../../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [sessionNotes, setSessionNotes] = useState('');
  const [vitalSigns, setVitalSigns] = useState({
    temperature: '',
    bloodPressure: '',
    heartRate: '',
    respiratoryRate: '',
    oxygenSaturation: ''
  });
  const [loading, setLoading] = useState(true);

  // Real data state
  const [stats, setStats] = useState({
    todayPatients: 0,
    pendingRecords: 0,
    pendingDiagnostics: 0,
    pendingPrescriptions: 0
  });
  const [todaysAppointments, setTodaysAppointments] = useState([]);
  const [upcomingTeleconsults, setUpcomingTeleconsults] = useState([]);

  // Get auth token and doctor ID (replace with your actual auth logic)
  const token = localStorage.getItem('authToken');
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const doctorId = currentUser?.id;

  // Define fetchDashboardData with useCallback to avoid dependency warning
  const fetchDashboardData = useCallback(async () => {
    if (!doctorId) return;
    
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [statsData, appointmentsData, teleconsultsData] = await Promise.all([
        api.get(`/analytics/doctors/${doctorId}/summary`),
        api.get(`/doctors/${doctorId}/todays-appointments`),
        api.get(`/doctors/${doctorId}/teleconsultations`)
      ]);

      setStats({
        todayPatients: statsData.today_patients || 0,
        pendingRecords: statsData.pending_records || 0,
        pendingDiagnostics: statsData.pending_diagnostics || 0,
        pendingPrescriptions: statsData.pending_prescriptions || 0
      });

      setTodaysAppointments(appointmentsData || []);
      setUpcomingTeleconsults(teleconsultsData || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleStartSession = (appointment) => {
    setSelectedPatient(appointment);
    setShowSessionModal(true);
  };

  const handleEndSession = async () => {
    try {
      const sessionData = {
        patient_id: selectedPatient.patient_id,
        doctor_id: doctorId,
        visit_date: new Date().toISOString().split('T')[0],
        diagnosis: sessionNotes,
        vital_signs: vitalSigns,
      };

      await api.post('/medical-records/session', sessionData);
      
      // Refresh dashboard data
      await fetchDashboardData();
      
      setShowSessionModal(false);
      setSelectedPatient(null);
      setSessionNotes('');
      setVitalSigns({
        temperature: '',
        bloodPressure: '',
        heartRate: '',
        respiratoryRate: '',
        oxygenSaturation: ''
      });
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const handleUpdateMedicalRecord = () => {
    setShowSessionModal(false);
    navigate('/medical-records/all', { 
      state: { 
        patientInfo: selectedPatient,
        vitalSigns: vitalSigns,
        notes: sessionNotes
      }
    });
  };

  const handleCreatePrescription = () => {
    setShowSessionModal(false);
    navigate('/prescriptions/all', {
      state: {
        patientInfo: selectedPatient,
        consultationNotes: sessionNotes
      }
    });
  };

  // Getting status color for badges
  const getStatusColor = (status) => {
    switch(status) {
      case 'Waiting':
        return 'danger';
      case 'Confirmed':
        return 'success';
      case 'Ready':
        return 'success';
      case 'Scheduled':
        return 'info';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="container-fluid py-4 bg-light">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 bg-light">
      <div className="row mb-4">
        <div className="col-12">
          <h2 className="fw-bold mb-0">Doctor Dashboard</h2>
          <p className="text-muted">Welcome back, Dr. {currentUser?.name || 'Doctor'}</p>
        </div>
      </div>
      
      {/* Stats Cards - Modernized appearance */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-3 h-100 overflow-hidden">
            <div className="card-body position-relative p-4">
              <div className="position-absolute top-0 end-0 mt-3 me-3 rounded-circle p-2" 
                   style={{ backgroundColor: 'rgba(227, 25, 55, 0.1)' }}>
                <i className="bi bi-people-fill fs-4 text-danger"></i>
              </div>
              <p className="text-muted fw-light mb-1">Today's Patients</p>
              <h2 className="display-6 fw-bold mb-0">{stats.todayPatients}</h2>
              <div className="text-success small mt-2">
                <i className="bi bi-arrow-up"></i> Active today
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-3 h-100 overflow-hidden">
            <div className="card-body position-relative p-4">
              <div className="position-absolute top-0 end-0 mt-3 me-3 rounded-circle p-2" 
                   style={{ backgroundColor: 'rgba(227, 25, 55, 0.1)' }}>
                <i className="bi bi-file-earmark-medical fs-4 text-danger"></i>
              </div>
              <p className="text-muted fw-light mb-1">Pending Records</p>
              <h2 className="display-6 fw-bold mb-0">{stats.pendingRecords}</h2>
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
                <i className="bi bi-file-earmark-text fs-4 text-danger"></i>
              </div>
              <p className="text-muted fw-light mb-1">Pending Diagnostics</p>
              <h2 className="display-6 fw-bold mb-0">{stats.pendingDiagnostics}</h2>
              <div className="text-muted small mt-2">
                <i className="bi bi-check2-circle"></i> All on schedule
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-3 h-100 overflow-hidden">
            <div className="card-body position-relative p-4">
              <div className="position-absolute top-0 end-0 mt-3 me-3 rounded-circle p-2" 
                   style={{ backgroundColor: 'rgba(227, 25, 55, 0.1)' }}>
                <i className="bi bi-prescription fs-4 text-danger"></i>
              </div>
              <p className="text-muted fw-light mb-1">Pending Prescriptions</p>
              <h2 className="display-6 fw-bold mb-0">{stats.pendingPrescriptions}</h2>
              <div className="text-danger small mt-2">
                <i className="bi bi-exclamation-triangle"></i> Needs review
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* Today's Appointments Table */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-header bg-white border-0 py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="card-title fw-bold mb-0">Today's Schedule</h5>
                <Link to="/doctors/schedule" className="btn btn-sm btn-danger rounded-pill px-3">
                  <i className="bi bi-calendar-week me-2"></i>View Full Schedule
                </Link>
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
                    {todaysAppointments.length > 0 ? (
                      todaysAppointments.map(apt => (
                        <tr key={apt.id}>
                          <td className="ps-4">
                            <div className="d-flex align-items-center">
                              <div className="me-3">
                                <i className="bi bi-clock text-muted"></i>
                              </div>
                              <span className="fw-medium">{apt.time}</span>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="avatar-circle me-2 bg-light text-primary d-flex align-items-center justify-content-center" 
                                   style={{ width: '36px', height: '36px', borderRadius: '50%' }}>
                                {apt.patient.charAt(0)}
                              </div>
                              <span>{apt.patient}</span>
                            </div>
                          </td>
                          <td><span className="text-muted">{apt.type}</span></td>
                          <td>
                            <span className={`badge text-bg-${getStatusColor(apt.status)} rounded-pill px-3 py-2`}>
                              {apt.status}
                            </span>
                          </td>
                          <td className="text-end pe-4">
                            <button 
                              className="btn btn-sm btn-outline-danger rounded-pill px-3"
                              onClick={() => handleStartSession(apt)}
                            >
                              <i className="bi bi-play-fill me-1"></i>
                              Start Session
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-muted">
                          <i className="bi bi-calendar-x fs-1 d-block mb-2"></i>
                          No appointments scheduled for today
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Teleconsultations */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="card-title fw-bold mb-0">
                <i className="bi bi-camera-video me-2 text-danger"></i>
                Upcoming Teleconsultations
              </h5>
            </div>
            <div className="card-body">
              {upcomingTeleconsults.length > 0 ? (
                <div className="d-flex flex-column gap-3">
                  {upcomingTeleconsults.map(consult => (
                    <div key={consult.id} className="p-3 border rounded-3 bg-white shadow-sm position-relative">
                      <div className="position-absolute top-0 end-0 mt-2 me-2">
                        <span className={`badge text-bg-${getStatusColor(consult.status)} rounded-pill`}>
                          {consult.status}
                        </span>
                      </div>
                      <div className="d-flex align-items-start">
                        <div className="avatar-circle me-3 bg-danger text-white d-flex align-items-center justify-content-center" 
                             style={{ width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0 }}>
                          {consult.patientName.charAt(0)}
                        </div>
                        <div>
                          <h6 className="mb-1 fw-bold">{consult.patientName}</h6>
                          <p className="mb-1 text-muted small">
                            <i className="bi bi-calendar me-1"></i>
                            {new Date(consult.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            <i className="bi bi-clock ms-2 me-1"></i>
                            {consult.time}
                          </p>
                          <p className="mb-0 small text-truncate">{consult.concern}</p>
                        </div>
                      </div>
                      {consult.status === 'Ready' && (
                        <div className="mt-3 text-end">
                          <a 
                            href={consult.meetingLink} 
                            className="btn btn-sm btn-success rounded-pill px-3"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <i className="bi bi-camera-video-fill me-1"></i>Join Now
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-calendar-x text-muted fs-1"></i>
                  <p className="mt-3 text-muted">No upcoming teleconsultations</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Patient Session Modal with improved styling */}
      {showSessionModal && selectedPatient && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">
                  <i className="bi bi-clipboard-pulse me-2"></i>
                  Patient Session
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowSessionModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-4 mb-4">
                  <div className="col-md-6">
                    <div className="p-3 border rounded-3 bg-light h-100">
                      <h6 className="mb-3 border-bottom pb-2 fw-bold">
                        <i className="bi bi-person me-2 text-danger"></i>
                        Patient Information
                      </h6>
                      <div className="mb-3">
                        <p className="small text-muted mb-1">Name</p>
                        <p className="mb-0 fw-medium">{selectedPatient.patient}</p>
                      </div>
                      <div className="mb-3">
                        <p className="small text-muted mb-1">Appointment Type</p>
                        <p className="mb-0 fw-medium">{selectedPatient.type}</p>
                      </div>
                      <div>
                        <p className="small text-muted mb-1">Scheduled Time</p>
                        <p className="mb-0 fw-medium">{selectedPatient.time}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="p-3 border rounded-3 bg-light h-100">
                      <h6 className="mb-3 border-bottom pb-2 fw-bold">
                        <i className="bi bi-heart-pulse me-2 text-danger"></i>
                        Vital Signs
                      </h6>
                      <div className="row g-3">
                        <div className="col-6">
                          <label className="form-label small">Temperature (°C)</label>
                          <div className="input-group input-group-sm">
                            <input
                              type="text"
                              className="form-control"
                              value={vitalSigns.temperature}
                              onChange={(e) => setVitalSigns({...vitalSigns, temperature: e.target.value})}
                            />
                            <span className="input-group-text bg-white">°C</span>
                          </div>
                        </div>
                        <div className="col-6">
                          <label className="form-label small">Blood Pressure</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="120/80"
                            value={vitalSigns.bloodPressure}
                            onChange={(e) => setVitalSigns({...vitalSigns, bloodPressure: e.target.value})}
                          />
                        </div>
                        <div className="col-6">
                          <label className="form-label small">Heart Rate</label>
                          <div className="input-group input-group-sm">
                            <input
                              type="text"
                              className="form-control"
                              value={vitalSigns.heartRate}
                              onChange={(e) => setVitalSigns({...vitalSigns, heartRate: e.target.value})}
                            />
                            <span className="input-group-text bg-white">bpm</span>
                          </div>
                        </div>
                        <div className="col-6">
                          <label className="form-label small">Respiratory Rate</label>
                          <div className="input-group input-group-sm">
                            <input
                              type="text"
                              className="form-control"
                              value={vitalSigns.respiratoryRate}
                              onChange={(e) => setVitalSigns({...vitalSigns, respiratoryRate: e.target.value})}
                            />
                            <span className="input-group-text bg-white">/min</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h6 className="mb-3 fw-bold">
                    <i className="bi bi-journal-text me-2 text-danger"></i>
                    Session Notes
                  </h6>
                  <textarea
                    className="form-control"
                    rows="5"
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    placeholder="Enter consultation notes, observations, diagnosis, etc..."
                  ></textarea>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <button 
                      className="btn btn-light border w-100 py-2"
                      onClick={handleUpdateMedicalRecord}
                    >
                      <i className="bi bi-file-earmark-medical text-primary me-2"></i>
                      Update Medical Record
                    </button>
                  </div>
                  <div className="col-md-6">
                    <button 
                      className="btn btn-light border w-100 py-2"
                      onClick={handleCreatePrescription}
                    >
                      <i className="bi bi-prescription text-primary me-2"></i>
                      Create Prescription
                    </button>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-top">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary" 
                  onClick={() => setShowSessionModal(false)}
                >
                  Cancel Session
                </button>
                <button 
                  type="button" 
                  className="btn btn-success"
                  onClick={handleEndSession}
                >
                  <i className="bi bi-check2 me-2"></i>
                  Complete Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
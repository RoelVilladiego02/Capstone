import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const PatientDashboard = () => {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    doctorId: '',
    date: '',
    time: '',
    concern: '',
    paymentMethod: ''
  });

  // Fetch real data from backend
  const [upcomingTeleconsults, setUpcomingTeleconsults] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentPrescriptions, setRecentPrescriptions] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Use your actual auth token and user id logic
  const token = localStorage.getItem('authToken');
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const patientId = currentUser?.id;

  useEffect(() => {
    setLoading(true);

    // Fetch appointments for this patient
    fetch(`/api/appointments?patient_id=${patientId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setUpcomingAppointments(data.filter(a => a.type !== 'Teleconsultation'));
        setUpcomingTeleconsults(data.filter(a => a.type === 'Teleconsultation'));
      });

    // Fetch prescriptions for this patient
    fetch(`/api/prescriptions?patient_id=${patientId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setRecentPrescriptions(data));

    // Fetch doctors
    fetch('/api/doctors', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setDoctors(data))
      .finally(() => setLoading(false));
  }, [token, patientId]);

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'
  ];

  const handleBooking = (e) => {
    e.preventDefault();
    // Handle booking submission
    console.log('Booking submitted:', bookingData);
    setShowBookingModal(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container-fluid py-4 bg-light">
      <div className="row g-4">
        {/* Welcome Banner */}
        <div className="col-12">
          <div className="card border-0 bg-primary text-white shadow rounded-lg">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="fw-bold mb-1">Welcome Back!</h2>
                  <p className="mb-0">Your health dashboard is updated and ready for you.</p>
                </div>
                <div className="d-none d-md-block">
                  <i className="bi bi-heart-pulse fs-1"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Teleconsultations Card */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm rounded-lg h-100">
            <div className="card-header bg-white border-0 pt-4 pb-0">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="card-title fw-bold mb-0">Upcoming Teleconsultations</h5>
                <button 
                  className="btn btn-sm rounded-pill px-3" 
                  style={{ backgroundColor: '#E31937', color: 'white' }}
                  onClick={() => setShowBookingModal(true)}
                >
                  <i className="bi bi-camera-video me-2"></i>Book Teleconsult
                </button>
              </div>
            </div>
            <div className="card-body">
              <div className="upcoming-consultations">
                {upcomingTeleconsults.length > 0 ? (
                  upcomingTeleconsults.map(consult => (
                    <div key={consult.id} className="consultation-card p-3 mb-3 border-0 shadow-sm rounded-lg bg-white">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1 fw-bold">{consult.doctor}</h6>
                          <p className="mb-1 text-muted small">
                            <i className="bi bi-calendar me-2"></i>
                            {new Date(consult.date).toLocaleDateString()} at {consult.time}
                          </p>
                          <p className="mb-0 small text-secondary">{consult.concern}</p>
                        </div>
                        {consult.status === 'Ready' && (
                          <a href={consult.meetingLink} className="btn btn-success btn-sm rounded-pill">
                            <i className="bi bi-camera-video-fill me-1"></i>Join Now
                          </a>
                        )}
                      </div>
                      <div className="mt-2">
                        <span className={`badge rounded-pill bg-${
                          consult.status === 'Ready' ? 'success' :
                          consult.status === 'Scheduled' ? 'primary' :
                          'secondary'
                        }`}>
                          {consult.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted py-4">
                    <i className="bi bi-calendar-x fs-1"></i>
                    <p className="mt-2">No upcoming teleconsultations</p>
                    <button className="btn btn-outline-primary rounded-pill" onClick={() => setShowBookingModal(true)}>
                      Schedule Your First Consultation
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Appointments Card */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm rounded-lg h-100">
            <div className="card-header bg-white border-0 pt-4 pb-0">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="card-title fw-bold mb-0">Upcoming Appointments</h5>
                <Link to="/appointments/new" className="btn btn-outline-primary btn-sm rounded-pill px-3">
                  <i className="bi bi-plus-circle me-1"></i> New
                </Link>
              </div>
            </div>
            <div className="card-body">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map(apt => (
                  <div key={apt.id} className="mb-3 p-3 border-0 shadow-sm rounded-lg bg-white">
                    <div className="d-flex align-items-center">
                      <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                        <i className="bi bi-calendar-check text-primary"></i>
                      </div>
                      <div>
                        <h6 className="fw-bold mb-1">{apt.date} at {apt.time}</h6>
                        <p className="mb-0 small text-secondary">
                          {apt.doctor} · {apt.type}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 text-end">
                      <Link to="/appointments" className="btn btn-sm btn-outline-primary rounded-pill">
                        View Details
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted py-4">
                  <i className="bi bi-calendar fs-1"></i>
                  <p className="mt-2">No upcoming appointments</p>
                  <Link to="/appointments/new" className="btn btn-outline-primary rounded-pill">
                    Schedule Your First Appointment
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Prescriptions Card */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm rounded-lg h-100">
            <div className="card-header bg-white border-0 pt-4 pb-0">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="card-title fw-bold mb-0">Recent Prescriptions</h5>
                <Link to="/prescriptions" className="btn btn-outline-primary btn-sm rounded-pill px-3">
                  View All
                </Link>
              </div>
            </div>
            <div className="card-body">
              {recentPrescriptions.length > 0 ? (
                recentPrescriptions.map(prescription => (
                  <div key={prescription.id} className="mb-3 p-3 border-0 shadow-sm rounded-lg bg-white">
                    <div className="d-flex align-items-center">
                      <div className="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                        <i className="bi bi-capsule text-info"></i>
                      </div>
                      <div>
                        <h6 className="fw-bold mb-1">{prescription.medication}</h6>
                        <p className="mb-0 small text-secondary">
                          {prescription.dosage} · Prescribed on {prescription.date}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted py-4">
                  <i className="bi bi-file-earmark-medical fs-1"></i>
                  <p className="mt-2">No recent prescriptions</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm rounded-lg h-100">
            <div className="card-header bg-white border-0 pt-4 pb-0">
              <h5 className="card-title fw-bold mb-0">Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <Link to="/medical-records" className="card border-0 shadow-sm h-100 text-decoration-none">
                    <div className="card-body text-center py-4">
                      <div className="rounded-circle bg-primary bg-opacity-10 p-3 mx-auto mb-3" style={{ width: 'fit-content' }}>
                        <i className="bi bi-file-medical fs-4 text-primary"></i>
                      </div>
                      <h6 className="mb-0 text-primary">Medical Records</h6>
                    </div>
                  </Link>
                </div>
                <div className="col-md-4">
                  <Link to="/profile" className="card border-0 shadow-sm h-100 text-decoration-none">
                    <div className="card-body text-center py-4">
                      <div className="rounded-circle bg-success bg-opacity-10 p-3 mx-auto mb-3" style={{ width: 'fit-content' }}>
                        <i className="bi bi-person fs-4 text-success"></i>
                      </div>
                      <h6 className="mb-0 text-success">Update Profile</h6>
                    </div>
                  </Link>
                </div>
                <div className="col-md-4">
                  <Link to="/billing-history" className="card border-0 shadow-sm h-100 text-decoration-none">
                    <div className="card-body text-center py-4">
                      <div className="rounded-circle bg-warning bg-opacity-10 p-3 mx-auto mb-3" style={{ width: 'fit-content' }}>
                        <i className="bi bi-receipt fs-4 text-warning"></i>
                      </div>
                      <h6 className="mb-0 text-warning">View Bills</h6>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-lg overflow-hidden">
              <div className="modal-header border-0 bg-primary text-white">
                <h5 className="modal-title fw-bold">Book Teleconsultation</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowBookingModal(false)}></button>
              </div>
              <form onSubmit={handleBooking}>
                <div className="modal-body p-4">
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Select Doctor</label>
                    <select 
                      className="form-select form-select-lg border-0 shadow-sm"
                      value={bookingData.doctorId}
                      onChange={(e) => setBookingData({...bookingData, doctorId: e.target.value})}
                      required
                    >
                      <option value="">Choose a doctor</option>
                      {doctors.map(doctor => (
                        <option key={doctor.id} value={doctor.id}>
                          {doctor.name} - {doctor.specialization} (₱{doctor.fee})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="row mb-4">
                    <div className="col-md-6 mb-3 mb-md-0">
                      <label className="form-label fw-semibold">Date</label>
                      <input
                        type="date"
                        className="form-control form-control-lg border-0 shadow-sm"
                        min={new Date().toISOString().split('T')[0]}
                        value={bookingData.date}
                        onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Time</label>
                      <select 
                        className="form-select form-select-lg border-0 shadow-sm"
                        value={bookingData.time}
                        onChange={(e) => setBookingData({...bookingData, time: e.target.value})}
                        required
                      >
                        <option value="">Select time</option>
                        {timeSlots.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">Reason for Consultation</label>
                    <textarea
                      className="form-control border-0 shadow-sm"
                      rows="3"
                      value={bookingData.concern}
                      onChange={(e) => setBookingData({...bookingData, concern: e.target.value})}
                      required
                      placeholder="Please describe your symptoms or reason for consultation"
                    ></textarea>
                  </div>

                  <div className="mb-2">
                    <label className="form-label fw-semibold">Payment Method</label>
                    <div className="row g-3">
                      {['Credit Card', 'GCash', 'PayMaya'].map(method => (
                        <div key={method} className="col-md-4">
                          <div 
                            className={`card h-100 border-0 shadow-sm p-3 text-center cursor-pointer ${
                              bookingData.paymentMethod === method ? 'bg-primary bg-opacity-10' : ''
                            }`}
                            onClick={() => setBookingData({...bookingData, paymentMethod: method})}
                            style={{ cursor: 'pointer' }}
                          >
                            <i className={`bi bi-${
                              method === 'Credit Card' ? 'credit-card' :
                              method === 'GCash' ? 'wallet2' : 'phone'
                            } fs-3 mb-2 ${bookingData.paymentMethod === method ? 'text-primary' : ''}`}></i>
                            <h6 className={`mb-0 ${bookingData.paymentMethod === method ? 'text-primary' : ''}`}>{method}</h6>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 bg-light p-4">
                  <button type="button" className="btn btn-lg btn-outline-secondary px-4 rounded-pill" onClick={() => setShowBookingModal(false)}>
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-lg btn-primary px-4 rounded-pill"
                    disabled={!bookingData.doctorId || !bookingData.date || !bookingData.time || !bookingData.concern || !bookingData.paymentMethod}
                  >
                    Confirm Booking {bookingData.doctorId && <span className="ms-1">
                      (₱{doctors.find(d => d.id === Number(bookingData.doctorId))?.fee || 0})
                    </span>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
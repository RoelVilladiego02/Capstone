import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { medicalRecordService } from '../services/medicalRecordService';
import { patientService } from '../services/patientService';
import AddMedicalRecordForm from '../components/medical-records/AddMedicalRecordForm';
import { extractPatientId } from '../utils/patientUtils';

const MedicalRecords = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('consultations');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [patientProfile, setPatientProfile] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Check if user has permission to add medical records
  const canAddRecords = () => {
    if (!user) return false;
    
    const userRoles = Array.isArray(user.roles) ? user.roles : [user.role];
    const authorizedRoles = ['Doctor', 'Admin', 'Nurse', 'Medical Staff'];
    
    return userRoles.some(role => authorizedRoles.includes(role));
  };

  // Check if user is a patient
  const isPatient = () => {
    if (!user) return false;
    const userRoles = Array.isArray(user.roles) ? user.roles : [user.role];
    return userRoles.includes('Patient');
  };

  // Handlers for patient actions
  const handleRequestCorrection = () => {
    // TODO: Open correction request modal
    alert('Request Correction feature coming soon!');
  };

  const handleAddPersonalNote = () => {
    // TODO: Open personal note modal
    alert('Add Personal Note feature coming soon!');
  };

  const handleUploadDocument = () => {
    // TODO: Open upload document modal
    alert('Upload Document feature coming soon!');
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchMedicalRecords();
  }, [isAuthenticated, navigate]);

  const fetchMedicalRecords = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get patient profile first
      const profile = await patientService.getMyProfile();
      setPatientProfile(profile);

      // Use extractPatientId utility for robust extraction
      const patientId = extractPatientId(profile);
      if (!patientId) {
        throw new Error('Patient ID not found in profile');
      }

      const records = await medicalRecordService.getByPatientId(patientId);
      setMedicalRecords(records);
    } catch (err) {
      console.error('Error fetching medical records:', err);
      setError(err.message || 'Failed to load medical records');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecord = () => {
    setShowAddForm(true);
  };

  const handleAddSuccess = () => {
    setShowAddForm(false);
    fetchMedicalRecords(); // Refresh the list
  };

  const handleAddCancel = () => {
    setShowAddForm(false);
  };

  const filterRecords = (recordsList) => {
    return recordsList.filter(record => {
      const matchesSearch = 
        Object.values(record).some(value => 
          value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      const matchesDate = !filterDate || record.visit_date === filterDate;
      return matchesSearch && matchesDate;
    });
  };

  const formatVitalSigns = (vitalSigns) => {
    if (!vitalSigns) return 'N/A';
    
    const vitals = typeof vitalSigns === 'string' ? JSON.parse(vitalSigns) : vitalSigns;
    return (
      <div>
        {vitals.temperature && <div>Temp: {vitals.temperature}</div>}
        {vitals.blood_pressure && <div>BP: {vitals.blood_pressure}</div>}
        {vitals.heart_rate && <div>HR: {vitals.heart_rate}</div>}
        {vitals.respiratory_rate && <div>RR: {vitals.respiratory_rate}</div>}
        {vitals.oxygen_saturation && <div>O2: {vitals.oxygen_saturation}</div>}
      </div>
    );
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Active':
        return 'badge bg-success';
      case 'Completed':
        return 'badge bg-primary';
      case 'Pending':
        return 'badge bg-warning text-dark';
      case 'Cancelled':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  };

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error!</h4>
          <p>{error}</p>
          <button className="btn btn-outline-danger" onClick={fetchMedicalRecords}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Medical Records</h4>
          <p className="text-muted mb-0">
            {patientProfile ? `Viewing records for ${patientProfile.user?.name || patientProfile.user?.first_name} ${patientProfile.user?.last_name}` : 'View and manage your medical history'}
          </p>
        </div>
        <div>
          <button className="btn btn-outline-primary me-2">
            <i className="bi bi-download me-2"></i>
            Export Records
          </button>
          {canAddRecords() && !isPatient() && (
            <button 
              className="btn" 
              style={{ backgroundColor: '#E31937', color: 'white' }}
              onClick={handleAddRecord}
            >
              <i className="bi bi-plus-lg me-2"></i>
              Add Record
            </button>
          )}
          {isPatient() && (
            <>
              <button className="btn btn-outline-secondary me-2" onClick={handleRequestCorrection}>
                <i className="bi bi-pencil-square me-2"></i>
                Request Correction
              </button>
              <button className="btn btn-outline-info me-2" onClick={handleAddPersonalNote}>
                <i className="bi bi-journal-text me-2"></i>
                Add Personal Note
              </button>
              <button className="btn btn-outline-success" onClick={handleUploadDocument}>
                <i className="bi bi-upload me-2"></i>
                Upload Document
              </button>
            </>
          )}
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white">
          <div className="row g-3 align-items-center">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <input
                type="date"
                className="form-control"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
            <div className="col">
              <ul className="nav nav-tabs card-header-tabs">
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'consultations' ? 'active' : ''}`}
                    onClick={() => setActiveTab('consultations')}
                  >
                    Consultations ({medicalRecords.length})
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="card-body">
          {activeTab === 'consultations' && (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Doctor</th>
                    <th>Diagnosis</th>
                    <th>Treatment</th>
                    <th>Vitals</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filterRecords(medicalRecords).length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center text-muted py-4">
                        No medical records found
                      </td>
                    </tr>
                  ) : (
                    filterRecords(medicalRecords).map(record => (
                      <tr key={record.id}>
                        <td>{new Date(record.visit_date).toLocaleDateString()}</td>
                        <td>{record.doctor?.name || 'N/A'}</td>
                        <td>
                          <div>{record.diagnosis}</div>
                          {record.notes && (
                            <small className="text-muted">
                              {record.notes.length > 50 ? `${record.notes.substring(0, 50)}...` : record.notes}
                            </small>
                          )}
                        </td>
                        <td>{record.treatment}</td>
                        <td>
                          <small>
                            {formatVitalSigns(record.vital_signs)}
                          </small>
                        </td>
                        <td>
                          <span className={getStatusBadgeClass(record.status)}>
                            {record.status}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => navigate(`/medical-records/${record.id}`)}
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-secondary">
                            <i className="bi bi-download"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Medical Record Form Modal */}
      {showAddForm && (
        <AddMedicalRecordForm
          onSuccess={handleAddSuccess}
          onCancel={handleAddCancel}
        />
      )}
    </div>
  );
};

export default MedicalRecords;

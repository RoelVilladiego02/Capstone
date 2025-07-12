import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { medicalRecordService } from '../../services/medicalRecordService';
import { patientService } from '../../services/patientService';
import { extractPatientId } from '../../utils/patientUtils';
import { useAuth } from '../../contexts/AuthContext';
import CorrectionRequestModal from './CorrectionRequestModal';
import PersonalNoteModal from './PersonalNoteModal';
import UploadedDocumentModal from './UploadedDocumentModal';

const MedicalRecordView = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('history');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patientRecord, setPatientRecord] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const { currentUser: user } = useAuth();

  // Check if user is a patient
  const isPatient = () => {
    if (!user) return false;
    const userRoles = Array.isArray(user.roles) ? user.roles : [user.role];
    return userRoles.includes('Patient');
  };

  // Check if user can add records
  const canAddRecords = () => {
    if (!user) return false;
    const userRoles = Array.isArray(user.roles) ? user.roles : [user.role];
    const authorizedRoles = ['Doctor', 'Admin', 'Nurse', 'Medical Staff'];
    return userRoles.some(role => authorizedRoles.includes(role));
  };

  // Handlers for patient actions
  const handleRequestCorrection = () => setShowCorrectionModal(true);
  const handleAddPersonalNote = () => setShowNoteModal(true);
  const handleUploadDocument = () => setShowUploadModal(true);

  useEffect(() => {
    const resolveAndFetch = async () => {
      setLoading(true);
      setError(null);
      let id = patientId;
      if (!id) {
        // Try to get current user's patient ID
        try {
          const profile = await patientService.getMyProfile();
          id = extractPatientId(profile);
          if (id) {
            navigate(`/medical-records/${id}`, { replace: true });
            return; // navigation will re-trigger useEffect
          } else {
            setError('Patient ID is required');
            setLoading(false);
            return;
          }
        } catch (err) {
          setError('Patient ID is required');
          setLoading(false);
          return;
        }
      }
      try {
        // Get patient information
        const patient = await patientService.getPatient(id);
        setPatientRecord(patient);
        // Get medical records for the patient
        const records = await medicalRecordService.getByPatientId(id);
        setMedicalRecords(records);
      } catch (err) {
        console.error('Error fetching patient data:', err);
        setError(err.message || 'Failed to load patient data');
      } finally {
        setLoading(false);
      }
    };
    resolveAndFetch();
    // Only depend on patientId and navigate
  }, [patientId, navigate]);

  // Filter records based on search and date
  const filteredRecords = useMemo(() => {
    const records = activeTab === 'consultations' ? medicalRecords : [];

    return records.filter(record => {
      const matchesSearch = 
        record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.treatment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.doctor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDate = !filterDate || record.visit_date === filterDate;
      return matchesSearch && matchesDate;
    });
  }, [activeTab, searchTerm, filterDate, medicalRecords]);

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
          <button className="btn btn-outline-danger" onClick={() => window.location.reload()}>
            Try Again
          </button>
          <button className="btn btn-outline-warning ms-2" onClick={() => navigate('/medical-records')}>
            Back to Medical Records
          </button>
        </div>
      </div>
    );
  }

  if (!patientRecord) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-warning" role="alert">
          <h4 className="alert-heading">Patient Not Found!</h4>
          <p>The requested patient could not be found.</p>
          <button className="btn btn-outline-warning" onClick={() => navigate('/medical-records')}>
            Back to Medical Records
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Patient Summary Card */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-2">
              <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" 
                   style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                {patientRecord.user?.name?.charAt(0) || patientRecord.user?.first_name?.charAt(0) || 'P'}
              </div>
            </div>
            <div className="col-md-10">
              <h4 className="mb-2">
                {patientRecord.user?.name || `${patientRecord.user?.first_name || ''} ${patientRecord.user?.last_name || ''}`}
              </h4>
              <div className="row">
                <div className="col-md-3">
                  <p className="mb-1"><strong>Age:</strong> {patientRecord.user?.age || patientRecord.age || 'N/A'}</p>
                </div>
                <div className="col-md-3">
                  <p className="mb-1"><strong>Gender:</strong> {patientRecord.gender || patientRecord.user?.gender || 'N/A'}</p>
                </div>
                <div className="col-md-3">
                  <p className="mb-1"><strong>Phone:</strong> {patientRecord.phone || patientRecord.user?.phone_number || 'N/A'}</p>
                </div>
                <div className="col-md-3">
                  <p className="mb-1"><strong>Email:</strong> {patientRecord.user?.email || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="card border-0 shadow-sm">
        <div className="card-header">
          <div className="row g-3">
            <div className="col-md-6">
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
            <div className="col-md-3">
              {canAddRecords() && !isPatient() && (
                <button className="btn w-100" style={{ backgroundColor: '#E31937', color: 'white' }}>
                  <i className="bi bi-plus-lg me-2"></i>Add New Record
                </button>
              )}
              {isPatient() && (
                <div className="d-flex flex-wrap gap-2">
                  <button className="btn btn-outline-secondary" onClick={handleRequestCorrection}>
                    <i className="bi bi-pencil-square me-2"></i>Request Correction
                  </button>
                  <button className="btn btn-outline-info" onClick={handleAddPersonalNote}>
                    <i className="bi bi-journal-text me-2"></i>Add Personal Note
                  </button>
                  <button className="btn btn-outline-success" onClick={handleUploadDocument}>
                    <i className="bi bi-upload me-2"></i>Upload Document
                  </button>
                </div>
              )}
            </div>
          </div>

          <ul className="nav nav-tabs card-header-tabs mt-3">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                Medical History
              </button>
            </li>
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

        <div className="card-body">
          {activeTab === 'history' && (
            <div className="row">
              <div className="col-md-6 mb-4">
                <h6 className="fw-bold mb-3">Patient Information</h6>
                <ul className="list-group">
                  <li className="list-group-item">
                    <i className="bi bi-person text-primary me-2"></i>
                    <strong>Name:</strong> {patientRecord.user?.name || `${patientRecord.user?.first_name || ''} ${patientRecord.user?.last_name || ''}`}
                  </li>
                  <li className="list-group-item">
                    <i className="bi bi-calendar text-primary me-2"></i>
                    <strong>Age:</strong> {patientRecord.user?.age || patientRecord.age || 'N/A'}
                  </li>
                  <li className="list-group-item">
                    <i className="bi bi-gender-ambiguous text-primary me-2"></i>
                    <strong>Gender:</strong> {patientRecord.gender || patientRecord.user?.gender || 'N/A'}
                  </li>
                  <li className="list-group-item">
                    <i className="bi bi-telephone text-primary me-2"></i>
                    <strong>Phone:</strong> {patientRecord.phone || patientRecord.user?.phone_number || 'N/A'}
                  </li>
                  <li className="list-group-item">
                    <i className="bi bi-envelope text-primary me-2"></i>
                    <strong>Email:</strong> {patientRecord.user?.email || 'N/A'}
                  </li>
                  <li className="list-group-item">
                    <i className="bi bi-geo-alt text-primary me-2"></i>
                    <strong>Address:</strong> {patientRecord.address || 'N/A'}
                  </li>
                </ul>
              </div>
              <div className="col-md-6 mb-4">
                <h6 className="fw-bold mb-3">Medical Summary</h6>
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  <strong>Total Consultations:</strong> {medicalRecords.length}
                </div>
                <div className="alert alert-success">
                  <i className="bi bi-check-circle me-2"></i>
                  <strong>Active Records:</strong> {medicalRecords.filter(r => r.status === 'Active').length}
                </div>
                <div className="alert alert-warning">
                  <i className="bi bi-clock me-2"></i>
                  <strong>Pending Records:</strong> {medicalRecords.filter(r => r.status === 'Pending').length}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'consultations' && (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Doctor</th>
                    <th>Diagnosis</th>
                    <th>Treatment</th>
                    <th>Vitals</th>
                    <th>Notes</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center text-muted py-4">
                        No consultation records found
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record, index) => (
                      <tr key={index}>
                        <td>{new Date(record.visit_date).toLocaleDateString()}</td>
                        <td>{record.doctor?.name || 'N/A'}</td>
                        <td>{record.diagnosis}</td>
                        <td>{record.treatment}</td>
                        <td>
                          <small>
                            {formatVitalSigns(record.vital_signs)}
                          </small>
                        </td>
                        <td>
                          {record.notes ? (
                            <span title={record.notes}>
                              {record.notes.length > 30 ? `${record.notes.substring(0, 30)}...` : record.notes}
                            </span>
                          ) : 'N/A'}
                        </td>
                        <td>
                          <span className={getStatusBadgeClass(record.status)}>
                            {record.status}
                          </span>
                        </td>
                        <td>
                          <button className="btn btn-sm btn-outline-primary me-2">
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
      {/* Modals for patient actions */}
      <CorrectionRequestModal show={showCorrectionModal} onClose={() => setShowCorrectionModal(false)} />
      <PersonalNoteModal show={showNoteModal} onClose={() => setShowNoteModal(false)} />
      <UploadedDocumentModal show={showUploadModal} onClose={() => setShowUploadModal(false)} />
    </div>
  );
};

export default MedicalRecordView;

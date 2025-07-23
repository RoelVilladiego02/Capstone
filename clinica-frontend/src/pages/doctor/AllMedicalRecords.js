import React, { useState, useEffect, useCallback } from 'react';
import { medicalRecordService } from '../../services/medicalRecordService';

const AllMedicalRecords = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [newRecord, setNewRecord] = useState({
    patientName: '',
    patientId: '',
    date: new Date().toISOString().split('T')[0],
    type: '',
    diagnosis: '',
    vitals: {
      temperature: '',
      bloodPressure: '',
      heartRate: '',
      respiratoryRate: '',
      oxygenSaturation: ''
    },
    symptoms: '',
    treatment: '',
    notes: '',
    status: 'Active'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedRecord, setEditedRecord] = useState(null);

  // Get auth token and doctor ID
  const token = localStorage.getItem('authToken');
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const doctorId = currentUser?.id;

  // Fetch medical records
  const fetchMedicalRecords = useCallback(async () => {
    if (!doctorId) return;
    
    setLoading(true);
    try {
      const data = await medicalRecordService.getAll();
      console.log('Raw medical records data:', data); // For debugging
      
      // Transform the data to match the expected format
      const transformedRecords = data.map(record => {
        // Parse vital signs if it's a string
        let vitalSigns = record.vital_signs;
        if (typeof vitalSigns === 'string') {
          try {
            vitalSigns = JSON.parse(vitalSigns);
          } catch (e) {
            console.warn('Failed to parse vital signs:', e);
            vitalSigns = {};
          }
        }

        // Get patient name from the patient relation
        let patientName = 'Unknown';
        if (record.patient) {
          if (record.patient.user && record.patient.user.name) {
            patientName = record.patient.user.name;
          } else if (record.patient.first_name || record.patient.last_name) {
            patientName = `${record.patient.first_name || ''} ${record.patient.last_name || ''}`.trim();
          }
        }

        return {
          id: record.id,
          patientName: patientName,
          patientId: record.patient_id,
          date: record.visit_date,
          type: record.type || 'Consultation',
          diagnosis: record.diagnosis,
          vitals: vitalSigns || {
            temperature: '',
            bloodPressure: '',
            heartRate: '',
            respiratoryRate: '',
            oxygenSaturation: ''
          },
          symptoms: record.symptoms || [],
          treatment: record.treatment,
          notes: record.notes,
          status: record.status || 'Active'
        };
      });
      
      setMedicalRecords(transformedRecords);
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error('Error fetching medical records:', error);
      setError(error.message || 'Failed to fetch medical records');
      setMedicalRecords([]); // Clear records on error
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    fetchMedicalRecords();
  }, [fetchMedicalRecords]);

  const handleEditRecord = () => {
    setIsEditing(true);
    setEditedRecord({...selectedRecord});
  };

  const handleSaveEdit = async () => {
    try {
      const response = await fetch(`/api/medical-records/${editedRecord.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          diagnosis: editedRecord.diagnosis,
          treatment: editedRecord.treatment,
          notes: editedRecord.notes,
          vital_signs: editedRecord.vitals,
          status: editedRecord.status
        })
      });

      if (response.ok) {
        // Update the records list
        const updatedRecords = medicalRecords.map(record => 
          record.id === editedRecord.id ? editedRecord : record
        );
        setMedicalRecords(updatedRecords);
        setSelectedRecord(editedRecord);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating medical record:', error);
    }
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();
    try {
      const recordData = {
        patient_id: newRecord.patientId,
        doctor_id: doctorId,
        visit_date: newRecord.date,
        diagnosis: newRecord.diagnosis,
        treatment: newRecord.treatment,
        notes: newRecord.notes,
        vital_signs: newRecord.vitals,
        status: newRecord.status
      };

      const response = await fetch('/api/medical-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(recordData)
      });

      if (response.ok) {
        const newMedicalRecord = await response.json();
        setMedicalRecords([newMedicalRecord, ...medicalRecords]);
        setShowAddModal(false);
        setNewRecord({
          patientName: '',
          patientId: '',
          date: new Date().toISOString().split('T')[0],
          type: '',
          diagnosis: '',
          vitals: {
            temperature: '',
            bloodPressure: '',
            heartRate: '',
            respiratoryRate: '',
            oxygenSaturation: ''
          },
          symptoms: '',
          treatment: '',
          notes: '',
          status: 'Active'
        });
      }
    } catch (error) {
      console.error('Error adding medical record:', error);
    }
  };

  // Filter records based on search and date
  const filteredRecords = medicalRecords.filter(record => {
    const matchesSearch = record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.patientId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !filterDate || record.date === filterDate;
    return matchesSearch && matchesDate;
  });

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
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError(null)}
            aria-label="Close"
          ></button>
        </div>
      )}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Patient Medical Records</h4>
          <p className="text-muted mb-0">View and manage all patient medical records</p>
        </div>
        <button 
          className="btn" 
          style={{ backgroundColor: '#E31937', color: 'white' }}
          onClick={() => setShowAddModal(true)}
        >
          <i className="bi bi-plus-lg me-2"></i>New Record
        </button>
      </div>

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
                  placeholder="Search by patient name or ID..."
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
          </div>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Patient</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Diagnosis</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length > 0 ? (
                  filteredRecords.map(record => (
                    <tr key={record.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="avatar me-2">
                            <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" 
                                 style={{ width: '40px', height: '40px' }}>
                              {record.patientName.charAt(0)}
                            </div>
                          </div>
                          <div>
                            <div className="fw-medium">{record.patientName}</div>
                            <small className="text-muted">ID: {record.patientId}</small>
                          </div>
                        </div>
                      </td>
                      <td>{new Date(record.date).toLocaleDateString()}</td>
                      <td>{record.type}</td>
                      <td>{record.diagnosis}</td>
                      <td>
                        <span className={`badge bg-${record.status === 'Active' ? 'success' : 'secondary'}`}>
                          {record.status}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group">
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => {
                              setSelectedRecord(record);
                              setShowModal(true);
                            }}
                          >
                            <i className="bi bi-eye me-1"></i>View Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      <i className="bi bi-file-earmark-medical fs-1 d-block mb-2"></i>
                      No medical records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add New Record Modal */}
      {showAddModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Medical Record</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <form onSubmit={handleAddRecord}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Patient ID</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newRecord.patientId}
                        onChange={(e) => setNewRecord({...newRecord, patientId: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Patient Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newRecord.patientName}
                        onChange={(e) => setNewRecord({...newRecord, patientName: e.target.value})}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={newRecord.date}
                        onChange={(e) => setNewRecord({...newRecord, date: e.target.value})}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Type</label>
                      <select 
                        className="form-select"
                        value={newRecord.type}
                        onChange={(e) => setNewRecord({...newRecord, type: e.target.value})}
                        required
                      >
                        <option value="">Select type</option>
                        <option>Consultation</option>
                        <option>Follow-up</option>
                        <option>Emergency</option>
                        <option>Routine Check-up</option>
                      </select>
                    </div>

                    {/* Vitals Section */}
                    <div className="col-12">
                      <h6 className="mb-3">Vitals</h6>
                      <div className="row g-3">
                        <div className="col-md-4">
                          <label className="form-label">Temperature (°C)</label>
                          <input
                            type="text"
                            className="form-control"
                            value={newRecord.vitals.temperature}
                            onChange={(e) => setNewRecord({
                              ...newRecord,
                              vitals: {...newRecord.vitals, temperature: e.target.value}
                            })}
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Blood Pressure</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="120/80"
                            value={newRecord.vitals.bloodPressure}
                            onChange={(e) => setNewRecord({
                              ...newRecord,
                              vitals: {...newRecord.vitals, bloodPressure: e.target.value}
                            })}
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Heart Rate (bpm)</label>
                          <input
                            type="text"
                            className="form-control"
                            value={newRecord.vitals.heartRate}
                            onChange={(e) => setNewRecord({
                              ...newRecord,
                              vitals: {...newRecord.vitals, heartRate: e.target.value}
                            })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-12">
                      <label className="form-label">Symptoms (comma-separated)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newRecord.symptoms}
                        onChange={(e) => setNewRecord({...newRecord, symptoms: e.target.value})}
                        placeholder="Fever, Cough, Sore throat"
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label">Diagnosis</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newRecord.diagnosis}
                        onChange={(e) => setNewRecord({...newRecord, diagnosis: e.target.value})}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label">Treatment</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={newRecord.treatment}
                        onChange={(e) => setNewRecord({...newRecord, treatment: e.target.value})}
                        required
                      ></textarea>
                    </div>

                    <div className="col-12">
                      <label className="form-label">Additional Notes</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        value={newRecord.notes}
                        onChange={(e) => setNewRecord({...newRecord, notes: e.target.value})}
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn"
                    style={{ backgroundColor: '#E31937', color: 'white' }}
                  >
                    Save Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Record Details Modal */}
      {showModal && selectedRecord && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Medical Record Details</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowModal(false);
                    setIsEditing(false);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6 className="mb-3">Patient Information</h6>
                    {isEditing ? (
                      <>
                        <div className="mb-3">
                          <label className="form-label">Patient Name</label>
                          <input
                            type="text"
                            className="form-control"
                            value={editedRecord.patientName}
                            onChange={(e) => setEditedRecord({
                              ...editedRecord,
                              patientName: e.target.value
                            })}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Patient ID</label>
                          <input
                            type="text"
                            className="form-control"
                            value={editedRecord.patientId}
                            onChange={(e) => setEditedRecord({
                              ...editedRecord,
                              patientId: e.target.value
                            })}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="mb-1"><strong>Name:</strong> {selectedRecord.patientName}</p>
                        <p className="mb-1"><strong>ID:</strong> {selectedRecord.patientId}</p>
                        <p className="mb-1"><strong>Date:</strong> {new Date(selectedRecord.date).toLocaleDateString()}</p>
                        <p className="mb-0"><strong>Type:</strong> {selectedRecord.type}</p>
                      </>
                    )}
                  </div>

                  <div className="col-md-6">
                    <h6 className="mb-3">Vital Signs</h6>
                    {isEditing ? (
                      <div className="row g-2">
                        <div className="col-6">
                          <label className="form-label">Temperature</label>
                          <input
                            type="text"
                            className="form-control"
                            value={editedRecord.vitals.temperature}
                            onChange={(e) => setEditedRecord({
                              ...editedRecord,
                              vitals: {...editedRecord.vitals, temperature: e.target.value}
                            })}
                          />
                        </div>
                        <div className="col-6">
                          <label className="form-label">Blood Pressure</label>
                          <input
                            type="text"
                            className="form-control"
                            value={editedRecord.vitals.bloodPressure}
                            onChange={(e) => setEditedRecord({
                              ...editedRecord,
                              vitals: {...editedRecord.vitals, bloodPressure: e.target.value}
                            })}
                          />
                        </div>
                        <div className="col-12">
                          <label className="form-label">Other Vitals</label>
                          <textarea
                            className="form-control"
                            value={`HR: ${editedRecord.vitals.heartRate}, RR: ${editedRecord.vitals.respiratoryRate}, O2: ${editedRecord.vitals.oxygenSaturation}`}
                            onChange={(e) => {
                              // Add parsing logic if needed
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="mb-1"><strong>Temperature:</strong> {selectedRecord.vitals.temperature}</p>
                        <p className="mb-1"><strong>Blood Pressure:</strong> {selectedRecord.vitals.bloodPressure}</p>
                        <p className="mb-1"><strong>Heart Rate:</strong> {selectedRecord.vitals.heartRate}</p>
                        <p className="mb-1"><strong>Respiratory Rate:</strong> {selectedRecord.vitals.respiratoryRate}</p>
                        <p className="mb-0"><strong>O2 Saturation:</strong> {selectedRecord.vitals.oxygenSaturation}</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="row mb-4">
                  <div className="col-12">
                    <h6 className="mb-3">Clinical Information</h6>
                    {isEditing ? (
                      <>
                        <div className="mb-3">
                          <label className="form-label">Diagnosis</label>
                          <input
                            type="text"
                            className="form-control"
                            value={editedRecord.diagnosis}
                            onChange={(e) => setEditedRecord({
                              ...editedRecord,
                              diagnosis: e.target.value
                            })}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Symptoms</label>
                          <textarea
                            className="form-control"
                            value={editedRecord.symptoms.join(', ')}
                            onChange={(e) => setEditedRecord({
                              ...editedRecord,
                              symptoms: e.target.value.split(',').map(s => s.trim())
                            })}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Treatment</label>
                          <textarea
                            className="form-control"
                            value={editedRecord.treatment}
                            onChange={(e) => setEditedRecord({
                              ...editedRecord,
                              treatment: e.target.value
                            })}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="mb-1"><strong>Diagnosis:</strong> {selectedRecord.diagnosis}</p>
                        <p className="mb-1"><strong>Symptoms:</strong> {selectedRecord.symptoms.join(', ')}</p>
                        <p className="mb-1"><strong>Treatment:</strong> {selectedRecord.treatment}</p>
                        <p className="mb-0"><strong>Notes:</strong> {selectedRecord.notes}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                {isEditing ? (
                  <>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-success"
                      onClick={handleSaveEdit}
                    >
                      Save Changes
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => setShowModal(false)}
                    >
                      Close
                    </button>
                    <button 
                      type="button" 
                      className="btn"
                      style={{ backgroundColor: '#E31937', color: 'white' }}
                      onClick={handleEditRecord}
                    >
                      <i className="bi bi-pencil me-2"></i>Edit Record
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllMedicalRecords;

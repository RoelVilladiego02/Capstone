import React, { useState } from 'react';

const AllMedicalRecords = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
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

  const handleEditRecord = () => {
    setIsEditing(true);
    setEditedRecord({...selectedRecord});
  };

  const handleSaveEdit = () => {
    // Here you would typically make an API call to update the record
    const updatedRecords = medicalRecords.map(record => 
      record.id === editedRecord.id ? editedRecord : record
    );
    // Update the records list
    medicalRecords.splice(0, medicalRecords.length, ...updatedRecords);
    setSelectedRecord(editedRecord);
    setIsEditing(false);
  };

  // Enhanced mock data for medical records
  const medicalRecords = [
    {
      id: 1,
      patientName: 'John Doe',
      patientId: 'P001',
      date: '2024-02-15',
      type: 'Consultation',
      diagnosis: 'Upper Respiratory Infection',
      vitals: {
        temperature: '37.8°C',
        bloodPressure: '120/80',
        heartRate: '75',
        respiratoryRate: '16',
        oxygenSaturation: '98%'
      },
      symptoms: ['Fever', 'Cough', 'Sore throat'],
      treatment: 'Prescribed antibiotics and rest',
      notes: 'Follow-up in 1 week if symptoms persist',
      status: 'Active'
    },
    {
      id: 2,
      patientName: 'Maria Garcia',
      patientId: 'P002',
      date: '2024-02-14',
      type: 'Follow-up',
      diagnosis: 'Hypertension - Well Controlled',
      vitals: {
        temperature: '36.6°C',
        bloodPressure: '135/85',
        heartRate: '68',
        respiratoryRate: '14',
        oxygenSaturation: '99%'
      },
      symptoms: ['None reported'],
      treatment: 'Continue current medication',
      notes: 'BP showing improvement. Maintain current regimen',
      status: 'Active'
    },
    {
      id: 3,
      patientName: 'Robert Brown',
      patientId: 'P003',
      date: '2024-02-13',
      type: 'Emergency',
      diagnosis: 'Acute Bronchitis',
      vitals: {
        temperature: '38.5°C',
        bloodPressure: '125/82',
        heartRate: '88',
        respiratoryRate: '20',
        oxygenSaturation: '95%'
      },
      symptoms: ['High fever', 'Severe cough', 'Chest pain', 'Difficulty breathing'],
      treatment: 'Prescribed bronchodilators and antibiotics',
      notes: 'Urgent follow-up required in 3 days',
      status: 'Critical'
    },
    {
      id: 4,
      patientName: 'Sarah Wilson',
      patientId: 'P004',
      date: '2024-02-12',
      type: 'Routine Check-up',
      diagnosis: 'Diabetes Type 2 - Controlled',
      vitals: {
        temperature: '36.7°C',
        bloodPressure: '128/78',
        heartRate: '72',
        respiratoryRate: '15',
        oxygenSaturation: '98%'
      },
      symptoms: ['Regular monitoring'],
      treatment: 'Adjust insulin dosage',
      notes: 'HbA1c levels improved. Continue diet and exercise plan',
      status: 'Stable'
    },
    {
      id: 5,
      patientName: 'James Anderson',
      patientId: 'P005',
      date: '2024-02-11',
      type: 'Post-Surgery',
      diagnosis: 'Post-Appendectomy Recovery',
      vitals: {
        temperature: '37.1°C',
        bloodPressure: '118/75',
        heartRate: '80',
        respiratoryRate: '16',
        oxygenSaturation: '97%'
      },
      symptoms: ['Mild incision site pain'],
      treatment: 'Wound care and pain management',
      notes: 'Healing well. Remove sutures in 5 days',
      status: 'Recovering'
    }
  ];

  const handleAddRecord = (e) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    const newMedicalRecord = {
      id: medicalRecords.length + 1,
      ...newRecord,
      symptoms: newRecord.symptoms.split(',').map(s => s.trim()),
      dateCreated: new Date().toISOString()
    };

    medicalRecords.unshift(newMedicalRecord);
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
  };

  return (
    <div className="container-fluid py-4">
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
                {medicalRecords.map(record => (
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
                ))}
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

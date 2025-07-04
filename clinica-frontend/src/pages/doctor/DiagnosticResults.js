import React, { useState } from 'react';

const DiagnosticResults = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [selectedDiagnostic, setSelectedDiagnostic] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newResult, setNewResult] = useState({
    patientId: '',
    patientName: '',
    type: '',
    diagnosis: '',
    vitals: {
      temperature: '',
      bloodPressure: '',
      heartRate: '',
      respiratoryRate: '',
      oxygenSaturation: ''
    },
    symptoms: [],
    testResults: {
      bloodWork: {
        wbc: '',
        rbc: '',
        platelets: '',
        comments: ''
      }
    },
    treatment: '',
    status: 'Pending'
  });

  // Mock data aligned with existing medical records
  const [diagnosticResults, setDiagnosticResults] = useState([
    {
      id: 1,
      patientName: "John Doe",
      patientId: "P001",
      date: "2024-02-15",
      type: "Consultation",
      diagnosis: "Upper Respiratory Infection",
      vitals: {
        temperature: "37.8°C",
        bloodPressure: "120/80",
        heartRate: "75",
        respiratoryRate: "16",
        oxygenSaturation: "98%"
      },
      symptoms: ["Fever", "Cough", "Sore throat"],
      testResults: {
        bloodWork: {
          wbc: "11,000/µL",
          rbc: "4.5M/µL",
          platelets: "250K/µL",
          comments: "Elevated WBC indicates infection"
        }
      },
      treatment: "Prescribed antibiotics and rest",
      status: "Completed"
    },
    {
      id: 2,
      patientName: "Maria Garcia",
      patientId: "P002",
      date: "2024-02-14",
      type: "Follow-up",
      diagnosis: "Hypertension - Well Controlled",
      vitals: {
        temperature: "36.6°C",
        bloodPressure: "135/85",
        heartRate: "68",
        respiratoryRate: "14",
        oxygenSaturation: "99%"
      },
      symptoms: ["None reported"],
      testResults: {
        bloodWork: {
          creatinine: "1.0 mg/dL",
          potassium: "4.0 mEq/L",
          sodium: "140 mEq/L",
          comments: "All values within normal range"
        },
        ecg: "Normal sinus rhythm"
      },
      treatment: "Continue current medication",
      status: "Completed"
    }
  ]);

  const handleViewDetails = (diagnostic) => {
    setSelectedDiagnostic(diagnostic);
    setShowModal(true);
  };

  const handleAddResult = (e) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log('New diagnostic result:', newResult);
    // Add the new result to the existing list
    setDiagnosticResults([...diagnosticResults, {
      id: diagnosticResults.length + 1,
      ...newResult,
      date: new Date().toISOString().split('T')[0]
    }]);
    setShowAddModal(false);
    setNewResult({
      patientId: '',
      patientName: '',
      type: '',
      diagnosis: '',
      vitals: {
        temperature: '',
        bloodPressure: '',
        heartRate: '',
        respiratoryRate: '',
        oxygenSaturation: ''
      },
      symptoms: [],
      testResults: {
        bloodWork: {
          wbc: '',
          rbc: '',
          platelets: '',
          comments: ''
        }
      },
      treatment: '',
      status: 'Pending'
    });
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Diagnostic Results</h4>
          <p className="text-muted mb-0">View and manage patient diagnostic results</p>
        </div>
        <button 
          className="btn" 
          style={{ backgroundColor: '#E31937', color: 'white' }}
          onClick={() => setShowAddModal(true)}
        >
          <i className="bi bi-plus-lg me-2"></i>Add New Result
        </button>
      </div>

      {/* Filters */}
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
                  placeholder="Search patients..."
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
                  <th>Diagnosis</th>
                  <th>Vitals</th>
                  <th>Test Results</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {diagnosticResults.map(result => (
                  <tr key={result.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="avatar me-2">
                          <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" 
                               style={{ width: '40px', height: '40px' }}>
                            {result.patientName.charAt(0)}
                          </div>
                        </div>
                        <div>
                          <div className="fw-medium">{result.patientName}</div>
                          <small className="text-muted">ID: {result.patientId}</small>
                        </div>
                      </div>
                    </td>
                    <td>{new Date(result.date).toLocaleDateString()}</td>
                    <td>{result.diagnosis}</td>
                    <td>
                      <small>
                        BP: {result.vitals.bloodPressure}<br/>
                        HR: {result.vitals.heartRate}
                      </small>
                    </td>
                    <td>
                      {Object.keys(result.testResults).map(test => (
                        <span key={test} className="badge bg-info me-1">{test}</span>
                      ))}
                    </td>
                    <td>
                      <span className="badge bg-success">
                        {result.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => handleViewDetails(result)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showModal && selectedDiagnostic && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Diagnostic Results - {selectedDiagnostic.patientName}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6 className="mb-3">Patient Information</h6>
                    <p className="mb-1"><strong>Name:</strong> {selectedDiagnostic.patientName}</p>
                    <p className="mb-1"><strong>ID:</strong> {selectedDiagnostic.patientId}</p>
                    <p className="mb-1"><strong>Date:</strong> {new Date(selectedDiagnostic.date).toLocaleDateString()}</p>
                  </div>
                  <div className="col-md-6">
                    <h6 className="mb-3">Vitals</h6>
                    {Object.entries(selectedDiagnostic.vitals).map(([key, value]) => (
                      <p key={key} className="mb-1">
                        <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <h6 className="mb-3">Test Results</h6>
                  {Object.entries(selectedDiagnostic.testResults).map(([testName, results]) => (
                    <div key={testName} className="card mb-3">
                      <div className="card-header">
                        {testName.charAt(0).toUpperCase() + testName.slice(1)}
                      </div>
                      <div className="card-body">
                        {Object.entries(results).map(([key, value]) => (
                          <p key={key} className="mb-1">
                            <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mb-4">
                  <h6 className="mb-3">Treatment & Notes</h6>
                  <p>{selectedDiagnostic.treatment}</p>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
                <button type="button" className="btn" style={{ backgroundColor: '#E31937', color: 'white' }}>
                  Download Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Result Modal */}
      {showAddModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Diagnostic Result</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <form onSubmit={handleAddResult}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Patient ID</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={newResult.patientId}
                        onChange={(e) => setNewResult({...newResult, patientId: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Patient Name</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={newResult.patientName}
                        onChange={(e) => setNewResult({...newResult, patientName: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Type</label>
                      <select 
                        className="form-select"
                        required
                        value={newResult.type}
                        onChange={(e) => setNewResult({...newResult, type: e.target.value})}
                      >
                        <option value="">Select type</option>
                        <option value="Consultation">Consultation</option>
                        <option value="Follow-up">Follow-up</option>
                        <option value="Emergency">Emergency</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Diagnosis</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={newResult.diagnosis}
                        onChange={(e) => setNewResult({...newResult, diagnosis: e.target.value})}
                      />
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
                            value={newResult.vitals.temperature}
                            onChange={(e) => setNewResult({
                              ...newResult,
                              vitals: {...newResult.vitals, temperature: e.target.value}
                            })}
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Blood Pressure</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="120/80"
                            value={newResult.vitals.bloodPressure}
                            onChange={(e) => setNewResult({
                              ...newResult,
                              vitals: {...newResult.vitals, bloodPressure: e.target.value}
                            })}
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Heart Rate (bpm)</label>
                          <input
                            type="text"
                            className="form-control"
                            value={newResult.vitals.heartRate}
                            onChange={(e) => setNewResult({
                              ...newResult,
                              vitals: {...newResult.vitals, heartRate: e.target.value}
                            })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Test Results Section */}
                    <div className="col-12">
                      <h6 className="mb-3">Blood Work Results</h6>
                      <div className="row g-3">
                        <div className="col-md-4">
                          <label className="form-label">WBC (/µL)</label>
                          <input
                            type="text"
                            className="form-control"
                            value={newResult.testResults.bloodWork.wbc}
                            onChange={(e) => setNewResult({
                              ...newResult,
                              testResults: {
                                ...newResult.testResults,
                                bloodWork: {...newResult.testResults.bloodWork, wbc: e.target.value}
                              }
                            })}
                          />
                        </div>
                        <div className="col-md-12">
                          <label className="form-label">Comments</label>
                          <textarea
                            className="form-control"
                            rows="3"
                            value={newResult.testResults.bloodWork.comments}
                            onChange={(e) => setNewResult({
                              ...newResult,
                              testResults: {
                                ...newResult.testResults,
                                bloodWork: {...newResult.testResults.bloodWork, comments: e.target.value}
                              }
                            })}
                          ></textarea>
                        </div>
                      </div>
                    </div>

                    <div className="col-12">
                      <label className="form-label">Treatment Plan</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        required
                        value={newResult.treatment}
                        onChange={(e) => setNewResult({...newResult, treatment: e.target.value})}
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn" style={{ backgroundColor: '#E31937', color: 'white' }}>
                    Save Result
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

export default DiagnosticResults;

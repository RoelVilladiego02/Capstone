import React, { useState, useEffect, useCallback } from 'react';
import { prescriptionService } from '../../services/prescriptionService';

const AllPrescriptions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState([]);
  const [newPrescription, setNewPrescription] = useState({
    patientName: '',
    patientId: '',
    date: new Date().toISOString().split('T')[0],
    diagnosis: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
    notes: '',
    status: 'Active'
  });

  // Get doctor ID from current user
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const doctorId = currentUser?.id;

  // Fetch prescriptions
  const fetchPrescriptions = useCallback(async () => {
    if (!doctorId) return;
    
    setLoading(true);
    try {
      const data = await prescriptionService.getByDoctor(doctorId);
      
      // Transform the data to match the expected format
      const transformedPrescriptions = data.map(prescription => ({
        id: prescription.id,
        patientName: prescription.patient?.user?.name || 'Unknown',
        patientId: prescription.patient_id,
        date: prescription.date,
        diagnosis: prescription.diagnosis,
        medications: prescription.medications || [],
        status: prescription.status || 'Active',
        notes: prescription.notes,
        prescribedBy: prescription.doctor?.name || 'Dr. Unknown'
      }));
      
      setPrescriptions(transformedPrescriptions);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  const handleAddMedication = () => {
    setNewPrescription({
      ...newPrescription,
      medications: [
        ...newPrescription.medications,
        { name: '', dosage: '', frequency: '', duration: '' }
      ]
    });
  };

  const handleRemoveMedication = (index) => {
    setNewPrescription({
      ...newPrescription,
      medications: newPrescription.medications.filter((_, i) => i !== index)
    });
  };

  const handleMedicationChange = (index, field, value) => {
    const updatedMedications = newPrescription.medications.map((med, i) => {
      if (i === index) {
        return { ...med, [field]: value };
      }
      return med;
    });

    setNewPrescription({
      ...newPrescription,
      medications: updatedMedications
    });
  };

  const handleSavePrescription = async (e) => {
    e.preventDefault();
    try {
      const prescriptionData = {
        patient_id: newPrescription.patientId,
        doctor_id: doctorId,
        date: newPrescription.date,
        diagnosis: newPrescription.diagnosis,
        medications: newPrescription.medications,
        notes: newPrescription.notes,
        status: newPrescription.status
      };

      const newPrescriptionWithId = await prescriptionService.create(prescriptionData);
      setPrescriptions([newPrescriptionWithId, ...prescriptions]);
      setShowAddModal(false);
      setNewPrescription({
        patientName: '',
        patientId: '',
        date: new Date().toISOString().split('T')[0],
        diagnosis: '',
        medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
        notes: '',
        status: 'Active'
      });
    } catch (error) {
      console.error('Error saving prescription:', error);
    }
  };

  // Filter prescriptions based on search and date
  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.patientId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !filterDate || prescription.date === filterDate;
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Patient Prescriptions</h4>
          <p className="text-muted mb-0">View and manage all patient prescriptions</p>
        </div>
        <button 
          className="btn" 
          style={{ backgroundColor: '#E31937', color: 'white' }}
          onClick={() => setShowAddModal(true)}
        >
          <i className="bi bi-plus-lg me-2"></i>New Prescription
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
                  placeholder="Search prescriptions..."
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
                  <th>Medications</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrescriptions.length > 0 ? (
                  filteredPrescriptions.map(prescription => (
                    <tr key={prescription.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="avatar me-2">
                            <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" 
                                 style={{ width: '40px', height: '40px' }}>
                              {prescription.patientName.charAt(0)}
                            </div>
                          </div>
                          <div>
                            <div className="fw-medium">{prescription.patientName}</div>
                            <small className="text-muted">ID: {prescription.patientId}</small>
                          </div>
                        </div>
                      </td>
                      <td>{new Date(prescription.date).toLocaleDateString()}</td>
                      <td>
                        {prescription.medications.map((med, index) => (
                          <div key={index}>
                            <small>{med.name} - {med.dosage}</small>
                          </div>
                        ))}
                      </td>
                      <td>
                        <span className={`badge bg-${prescription.status === 'Active' ? 'success' : 'secondary'}`}>
                          {prescription.status}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group">
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => {
                              setSelectedPrescription(prescription);
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
                    <td colSpan="5" className="text-center py-4 text-muted">
                      <i className="bi bi-prescription fs-1 d-block mb-2"></i>
                      No prescriptions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Prescription Details Modal */}
      {showModal && selectedPrescription && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Prescription Details</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6 className="text-muted mb-3">Patient Information</h6>
                    <p className="mb-1"><strong>Name:</strong> {selectedPrescription.patientName}</p>
                    <p className="mb-1"><strong>ID:</strong> {selectedPrescription.patientId}</p>
                  </div>
                  <div className="col-md-6">
                    <h6 className="text-muted mb-3">Prescription Details</h6>
                    <p className="mb-1"><strong>Date:</strong> {new Date(selectedPrescription.date).toLocaleDateString()}</p>
                    <p className="mb-1"><strong>Diagnosis:</strong> {selectedPrescription.diagnosis}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <h6 className="text-muted mb-3">Medications</h6>
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Medication</th>
                          <th>Dosage</th>
                          <th>Frequency</th>
                          <th>Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPrescription.medications.map((med, index) => (
                          <tr key={index}>
                            <td>{med.name}</td>
                            <td>{med.dosage}</td>
                            <td>{med.frequency}</td>
                            <td>{med.duration}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mb-3">
                  <h6 className="text-muted mb-3">Notes</h6>
                  <p className="mb-0">{selectedPrescription.notes || 'No notes available'}</p>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Prescription Modal */}
      {showAddModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">New Prescription</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <form onSubmit={handleSavePrescription}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Patient ID</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={newPrescription.patientId}
                        onChange={(e) => setNewPrescription({
                          ...newPrescription,
                          patientId: e.target.value
                        })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Patient Name</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={newPrescription.patientName}
                        onChange={(e) => setNewPrescription({
                          ...newPrescription,
                          patientName: e.target.value
                        })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Date</label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={newPrescription.date}
                        onChange={(e) => setNewPrescription({
                          ...newPrescription,
                          date: e.target.value
                        })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Diagnosis</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={newPrescription.diagnosis}
                        onChange={(e) => setNewPrescription({
                          ...newPrescription,
                          diagnosis: e.target.value
                        })}
                      />
                    </div>

                    {/* Medications Section */}
                    <div className="col-12">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <label className="form-label">Medications</label>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={handleAddMedication}
                        >
                          <i className="bi bi-plus-lg me-1"></i>Add Medication
                        </button>
                      </div>
                      {newPrescription.medications.map((medication, index) => (
                        <div key={index} className="card mb-3">
                          <div className="card-body">
                            <div className="row g-3">
                              <div className="col-md-6">
                                <label className="form-label">Medication Name</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  required
                                  value={medication.name}
                                  onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                                />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label">Dosage</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  required
                                  value={medication.dosage}
                                  onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                                />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label">Frequency</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  required
                                  value={medication.frequency}
                                  onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                                />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label">Duration</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  required
                                  value={medication.duration}
                                  onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                                />
                              </div>
                            </div>
                            {index > 0 && (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger mt-2"
                                onClick={() => handleRemoveMedication(index)}
                              >
                                <i className="bi bi-trash me-1"></i>Remove
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="col-12">
                      <label className="form-label">Notes</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={newPrescription.notes}
                        onChange={(e) => setNewPrescription({
                          ...newPrescription,
                          notes: e.target.value
                        })}
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
                    Save Prescription
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

export default AllPrescriptions;

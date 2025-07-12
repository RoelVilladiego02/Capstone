import React, { useState, useEffect } from 'react';
import { medicalRecordService } from '../../services/medicalRecordService';
import { patientService } from '../../services/patientService';
import { userService } from '../../services/userService';

const AddMedicalRecordForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    visit_date: new Date().toISOString().split('T')[0],
    diagnosis: '',
    treatment: '',
    notes: '',
    vital_signs: {
      temperature: '',
      blood_pressure: '',
      heart_rate: '',
      respiratory_rate: '',
      oxygen_saturation: ''
    },
    status: 'Active'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetchPatientsAndDoctors();
  }, []);

  const fetchPatientsAndDoctors = async () => {
    try {
      const [patientsData, doctorsData] = await Promise.all([
        patientService.getPatients(),
        userService.getDoctors()
      ]);
      setPatients(patientsData);
      setDoctors(doctorsData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load patients and doctors');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVitalSignsChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      vital_signs: {
        ...prev.vital_signs,
        [name]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Filter out empty vital signs
      const vitalSigns = Object.fromEntries(
        Object.entries(formData.vital_signs).filter(([_, value]) => value.trim() !== '')
      );

      const recordData = {
        ...formData,
        vital_signs: vitalSigns
      };

      await medicalRecordService.create(recordData);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error creating medical record:', err);
      setError(err.message || 'Failed to create medical record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add New Medical Record</h5>
            <button type="button" className="btn-close" onClick={onCancel}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Patient *</label>
                  <select
                    className="form-select"
                    name="patient_id"
                    value={formData.patient_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Patient</option>
                    {patients.map(patient => (
                      <option key={patient.id} value={patient.id}>
                        {patient.user?.name || `${patient.user?.first_name} ${patient.user?.last_name}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Doctor *</label>
                  <select
                    className="form-select"
                    name="doctor_id"
                    value={formData.doctor_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map(doctor => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Visit Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    name="visit_date"
                    value={formData.visit_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label">Diagnosis *</label>
                  <textarea
                    className="form-control"
                    name="diagnosis"
                    value={formData.diagnosis}
                    onChange={handleInputChange}
                    rows="2"
                    required
                  ></textarea>
                </div>

                <div className="col-12">
                  <label className="form-label">Treatment *</label>
                  <textarea
                    className="form-control"
                    name="treatment"
                    value={formData.treatment}
                    onChange={handleInputChange}
                    rows="2"
                    required
                  ></textarea>
                </div>

                <div className="col-12">
                  <label className="form-label">Notes</label>
                  <textarea
                    className="form-control"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                  ></textarea>
                </div>

                <div className="col-12">
                  <h6 className="mb-3">Vital Signs</h6>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label">Temperature</label>
                      <input
                        type="text"
                        className="form-control"
                        name="temperature"
                        value={formData.vital_signs.temperature}
                        onChange={handleVitalSignsChange}
                        placeholder="e.g., 37.2°C"
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Blood Pressure</label>
                      <input
                        type="text"
                        className="form-control"
                        name="blood_pressure"
                        value={formData.vital_signs.blood_pressure}
                        onChange={handleVitalSignsChange}
                        placeholder="e.g., 120/80"
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Heart Rate</label>
                      <input
                        type="text"
                        className="form-control"
                        name="heart_rate"
                        value={formData.vital_signs.heart_rate}
                        onChange={handleVitalSignsChange}
                        placeholder="e.g., 72 bpm"
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Respiratory Rate</label>
                      <input
                        type="text"
                        className="form-control"
                        name="respiratory_rate"
                        value={formData.vital_signs.respiratory_rate}
                        onChange={handleVitalSignsChange}
                        placeholder="e.g., 16/min"
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Oxygen Saturation</label>
                      <input
                        type="text"
                        className="form-control"
                        name="oxygen_saturation"
                        value={formData.vital_signs.oxygen_saturation}
                        onChange={handleVitalSignsChange}
                        placeholder="e.g., 98%"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onCancel}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Creating...
                  </>
                ) : (
                  'Create Record'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMedicalRecordForm; 
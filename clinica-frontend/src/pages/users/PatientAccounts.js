import React, { useEffect, useState } from 'react';
import { userService } from '../../services/userService';

const PatientAccounts = () => {
  const [patientsList, setPatientsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editPatient, setEditPatient] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', age: '', gender: '' });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = () => {
    setLoading(true);
    setError(null);
    userService.getPatients()
      .then(data => {
        setPatientsList(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load patient accounts.');
        setLoading(false);
      });
  };

  const handleDeactivate = (id) => {
    userService.deactivateUser(id)
      .then(() => {
        setPatientsList(prev => prev.map(p => p.id === id ? { ...p, status: 'Inactive' } : p));
      })
      .catch(() => alert('Failed to deactivate patient.'));
  };

  const openEditModal = (patient) => {
    setEditPatient(patient);
    setEditForm({
      name: patient.name || '',
      email: patient.email || '',
      age: patient.age || '',
      gender: patient.gender || '',
    });
    setEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSave = () => {
    userService.updateUser(editPatient.id, editForm)
      .then(() => {
        setPatientsList(prev => prev.map(p => p.id === editPatient.id ? { ...p, ...editForm } : p));
        setEditModalOpen(false);
      })
      .catch(() => alert('Failed to update patient.'));
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Patient Accounts</h4>
      </div>
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {loading ? (
            <div>Loading patient accounts...</div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patientsList.length === 0 ? (
                    <tr><td colSpan="6" className="text-center">No patient accounts found.</td></tr>
                  ) : (
                    patientsList.map(patient => (
                      <tr key={patient.id}>
                        <td>{patient.name}</td>
                        <td>{patient.email}</td>
                        <td>{patient.age || '-'}</td>
                        <td>{patient.gender || '-'}</td>
                        <td>
                          <span className={`badge bg-${patient.status === 'Active' ? 'success' : 'secondary'}`}>{patient.status}</span>
                        </td>
                        <td>
                          <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openEditModal(patient)}>Edit</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeactivate(patient.id)} disabled={patient.status === 'Inactive'}>Deactivate</button>
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
      {/* Edit Modal */}
      {editModalOpen && (
        <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Patient</h5>
                <button type="button" className="btn-close" onClick={() => setEditModalOpen(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input type="text" className="form-control" name="name" value={editForm.name} onChange={handleEditChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" name="email" value={editForm.email} onChange={handleEditChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Age</label>
                  <input type="number" className="form-control" name="age" value={editForm.age} onChange={handleEditChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Gender</label>
                  <select className="form-control" name="gender" value={editForm.gender} onChange={handleEditChange}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditModalOpen(false)}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={handleEditSave}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientAccounts;

import React, { useEffect, useState } from 'react';
import { userService } from '../../services/userService';

const DoctorAccounts = () => {
  const [doctorsList, setDoctorsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editDoctor, setEditDoctor] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', specialization: '', department: '' });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = () => {
    setLoading(true);
    setError(null);
    userService.getDoctors()
      .then(data => {
        setDoctorsList(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load doctor accounts.');
        setLoading(false);
      });
  };

  const handleDeactivate = (id) => {
    userService.deactivateUser(id)
      .then(() => {
        setDoctorsList(prev => prev.map(d => d.id === id ? { ...d, status: 'Inactive' } : d));
      })
      .catch(() => alert('Failed to deactivate doctor.'));
  };

  const openEditModal = (doctor) => {
    setEditDoctor(doctor);
    setEditForm({
      name: doctor.name || '',
      email: doctor.email || '',
      specialization: doctor.specialization || '',
      department: doctor.department || '',
    });
    setEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSave = () => {
    userService.updateUser(editDoctor.id, editForm)
      .then(() => {
        setDoctorsList(prev => prev.map(d => d.id === editDoctor.id ? { ...d, ...editForm } : d));
        setEditModalOpen(false);
      })
      .catch(() => alert('Failed to update doctor.'));
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Doctor Accounts</h4>
        <button className="btn" style={{ backgroundColor: '#E31937', color: 'white' }}>
          <i className="bi bi-plus-lg me-2"></i>Add Doctor
        </button>
      </div>
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {loading ? (
            <div>Loading doctor accounts...</div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Specialization</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {doctorsList.length === 0 ? (
                    <tr><td colSpan="6" className="text-center">No doctor accounts found.</td></tr>
                  ) : (
                    doctorsList.map(doctor => (
                      <tr key={doctor.id}>
                        <td>{doctor.name}</td>
                        <td>{doctor.email}</td>
                        <td>{doctor.specialization || '-'}</td>
                        <td>{doctor.department || '-'}</td>
                        <td>
                          <span className={`badge bg-${doctor.status === 'Active' ? 'success' : 'secondary'}`}>{doctor.status}</span>
                        </td>
                        <td>
                          <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openEditModal(doctor)}>Edit</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeactivate(doctor.id)} disabled={doctor.status === 'Inactive'}>Deactivate</button>
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
                <h5 className="modal-title">Edit Doctor</h5>
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
                  <label className="form-label">Specialization</label>
                  <input type="text" className="form-control" name="specialization" value={editForm.specialization} onChange={handleEditChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Department</label>
                  <input type="text" className="form-control" name="department" value={editForm.department} onChange={handleEditChange} />
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

export default DoctorAccounts;

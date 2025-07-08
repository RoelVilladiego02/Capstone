import React, { useEffect, useState } from 'react';
import { userService } from '../../services/userService';

const StaffAccounts = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editStaff, setEditStaff] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '' });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = () => {
    setLoading(true);
    setError(null);
    userService.getUsers({ role: 'Staff' })
      .then(data => {
        setStaffList(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load staff accounts.');
        setLoading(false);
      });
  };

  const handleDeactivate = (id) => {
    userService.deactivateUser(id)
      .then(() => {
        setStaffList(prev => prev.map(s => s.id === id ? { ...s, status: 'Inactive' } : s));
      })
      .catch(() => alert('Failed to deactivate staff member.'));
  };

  const openEditModal = (staff) => {
    setEditStaff(staff);
    setEditForm({
      name: staff.name || '',
      email: staff.email || '',
    });
    setEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSave = () => {
    userService.updateUser(editStaff.id, editForm)
      .then(() => {
        setStaffList(prev => prev.map(s => s.id === editStaff.id ? { ...s, ...editForm } : s));
        setEditModalOpen(false);
      })
      .catch(() => alert('Failed to update staff member.'));
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Staff Accounts</h4>
        <button className="btn" style={{ backgroundColor: '#E31937', color: 'white' }}>
          <i className="bi bi-plus-lg me-2"></i>Add Staff Member
        </button>
      </div>
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {loading ? (
            <div>Loading staff accounts...</div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staffList.length === 0 ? (
                    <tr><td colSpan="4" className="text-center">No staff accounts found.</td></tr>
                  ) : (
                    staffList.map(staff => (
                      <tr key={staff.id}>
                        <td>{staff.name}</td>
                        <td>{staff.email}</td>
                        <td>
                          <span className={`badge bg-${staff.status === 'Active' ? 'success' : 'secondary'}`}> {staff.status} </span>
                        </td>
                        <td>
                          <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openEditModal(staff)}>Edit</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeactivate(staff.id)} disabled={staff.status === 'Inactive'}>Deactivate</button>
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
                <h5 className="modal-title">Edit Staff Member</h5>
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

export default StaffAccounts;

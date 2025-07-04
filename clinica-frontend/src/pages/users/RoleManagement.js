import React, { useState } from 'react';

const RoleManagement = () => {
  const [roles] = useState([
    {
      id: 1,
      name: 'Doctor',
      description: 'Medical staff with full patient access',
      permissions: ['view_patients', 'edit_medical_records', 'prescribe_medicine']
    },
    {
      id: 2,
      name: 'Receptionist',
      description: 'Front desk staff managing appointments',
      permissions: ['view_appointments', 'edit_appointments', 'view_billing']
    }
  ]);

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Role Management</h4>
        <button className="btn" style={{ backgroundColor: '#E31937', color: 'white' }}>
          <i className="bi bi-plus-lg me-2"></i>Create Role
        </button>
      </div>

      <div className="row">
        {roles.map(role => (
          <div key={role.id} className="col-md-6 mb-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h5 className="card-title mb-1">{role.name}</h5>
                    <p className="text-muted small mb-0">{role.description}</p>
                  </div>
                  <div className="dropdown">
                    <button className="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                      Actions
                    </button>
                    <ul className="dropdown-menu">
                      <li><button className="dropdown-item">Edit Role</button></li>
                      <li><button className="dropdown-item">Manage Permissions</button></li>
                      <li><button className="dropdown-item text-danger">Delete Role</button></li>
                    </ul>
                  </div>
                </div>
                
                <div>
                  <h6 className="mb-2">Permissions:</h6>
                  {role.permissions.map((permission, index) => (
                    <span key={index} className="badge bg-light text-dark me-2 mb-2">
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoleManagement;

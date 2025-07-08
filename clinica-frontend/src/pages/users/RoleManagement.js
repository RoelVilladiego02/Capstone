import React, { useEffect, useState } from 'react';
import { roleService } from '../../services/roleService';

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    roleService.getRoles()
      .then(data => {
        setRoles(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load roles.');
        setLoading(false);
      });
  }, []);

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Role Management</h4>
        <button className="btn" style={{ backgroundColor: '#E31937', color: 'white' }}>
          <i className="bi bi-plus-lg me-2"></i>Create Role
        </button>
      </div>

      {loading ? (
        <div>Loading roles...</div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <div className="row">
          {roles.length === 0 ? (
            <div className="col-12 text-center">No roles found.</div>
          ) : (
            roles.map(role => (
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
                      {role.permissions && role.permissions.length > 0 ? (
                        role.permissions.map((permission, index) => (
                          <span key={permission.id || index} className="badge bg-light text-dark me-2 mb-2">
                            {permission.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted">No permissions assigned</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default RoleManagement;

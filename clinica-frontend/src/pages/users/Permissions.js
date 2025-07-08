import React, { useEffect, useState } from 'react';
import { permissionService } from '../../services/permissionService';

const Permissions = () => {
  const [groupedPermissions, setGroupedPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    permissionService.getPermissions()
      .then(data => {
        // Group permissions by category
        const groups = {};
        data.forEach(perm => {
          const cat = perm.category || 'Uncategorized';
          if (!groups[cat]) groups[cat] = [];
          groups[cat].push(perm);
        });
        // Convert to array for rendering
        setGroupedPermissions(Object.entries(groups).map(([category, permissions], idx) => ({
          id: idx + 1,
          category,
          permissions
        })));
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load permissions.');
        setLoading(false);
      });
  }, []);

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Permissions Management</h4>
        <button className="btn" style={{ backgroundColor: '#E31937', color: 'white' }}>
          <i className="bi bi-plus-lg me-2"></i>Add Permission
        </button>
      </div>

      {loading ? (
        <div>Loading permissions...</div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        groupedPermissions.map(category => (
          <div key={category.id} className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">{category.category}</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Permission</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {category.permissions.map((permission, index) => (
                      <tr key={permission.id || index}>
                        <td>{permission.name}</td>
                        <td>{permission.description}</td>
                        <td>
                          <button className="btn btn-sm btn-outline-primary me-2">Edit</button>
                          <button className="btn btn-sm btn-outline-danger">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Permissions;

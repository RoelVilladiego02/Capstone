import React, { useState } from 'react';

const Permissions = () => {
  const [permissions] = useState([
    {
      id: 1,
      category: 'Patient Records',
      permissions: [
        { name: 'view_patients', description: 'View patient information' },
        { name: 'edit_medical_records', description: 'Edit medical records' },
        { name: 'delete_records', description: 'Delete patient records' }
      ]
    },
    {
      id: 2,
      category: 'Appointments',
      permissions: [
        { name: 'view_appointments', description: 'View appointment schedule' },
        { name: 'create_appointment', description: 'Create new appointments' },
        { name: 'cancel_appointment', description: 'Cancel appointments' }
      ]
    }
  ]);

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Permissions Management</h4>
        <button className="btn" style={{ backgroundColor: '#E31937', color: 'white' }}>
          <i className="bi bi-plus-lg me-2"></i>Add Permission
        </button>
      </div>

      {permissions.map(category => (
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
                    <tr key={index}>
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
      ))}
    </div>
  );
};

export default Permissions;

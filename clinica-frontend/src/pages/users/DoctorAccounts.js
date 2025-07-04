import React, { useState } from 'react';

const DoctorAccounts = () => {
  const [doctorsList] = useState([
    { id: 1, name: 'Dr. John Smith', email: 'john.s@clinica.com', specialization: 'General Medicine', department: 'General Practice', status: 'Active' },
    { id: 2, name: 'Dr. Maria Garcia', email: 'maria.g@clinica.com', specialization: 'Pediatrics', department: 'Pediatrics', status: 'Active' },
    { id: 3, name: 'Dr. Robert Brown', email: 'robert.b@clinica.com', specialization: 'Cardiology', department: 'Cardiology', status: 'Inactive' }
  ]);

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
                {doctorsList.map(doctor => (
                  <tr key={doctor.id}>
                    <td>{doctor.name}</td>
                    <td>{doctor.email}</td>
                    <td>{doctor.specialization}</td>
                    <td>{doctor.department}</td>
                    <td>
                      <span className={`badge bg-${doctor.status === 'Active' ? 'success' : 'secondary'}`}>
                        {doctor.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary me-2">Edit</button>
                      <button className="btn btn-sm btn-outline-danger">Deactivate</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorAccounts;

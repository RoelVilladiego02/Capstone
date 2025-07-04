import React, { useState } from 'react';

const PatientAccounts = () => {
  const [patientsList] = useState([
    { id: 1, name: 'John Doe', email: 'john.d@email.com', age: 45, gender: 'Male', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane.s@email.com', age: 32, gender: 'Female', status: 'Active' },
    { id: 3, name: 'Mike Wilson', email: 'mike.w@email.com', age: 28, gender: 'Male', status: 'Inactive' }
  ]);

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Patient Accounts</h4>
        <button className="btn" style={{ backgroundColor: '#E31937', color: 'white' }}>
          <i className="bi bi-plus-lg me-2"></i>Add Patient
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
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patientsList.map(patient => (
                  <tr key={patient.id}>
                    <td>{patient.name}</td>
                    <td>{patient.email}</td>
                    <td>{patient.age}</td>
                    <td>{patient.gender}</td>
                    <td>
                      <span className={`badge bg-${patient.status === 'Active' ? 'success' : 'secondary'}`}>
                        {patient.status}
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

export default PatientAccounts;

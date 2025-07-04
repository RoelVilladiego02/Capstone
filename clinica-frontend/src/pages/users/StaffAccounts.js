import React, { useState } from 'react';

const StaffAccounts = () => {
  const [staffList] = useState([
    { id: 2, name: 'Jane Wilson', email: 'jane.w@clinica.com', role: 'Receptionist', department: 'Front Desk', status: 'Active' },
    { id: 3, name: 'Mike Brown', email: 'mike.b@clinica.com', role: 'InventoryManager', department: 'Supplies', status: 'Active' },
    { id: 4, name: 'Sarah Davis', email: 'sarah.d@clinica.com', role: 'Receptionist', department: 'Front Desk', status: 'Inactive' },
    { id: 5, name: 'Tom Harris', email: 'tom.h@clinica.com', role: 'InventoryManager', department: 'Supplies', status: 'Active' }
  ]);

  // Filter only receptionist and inventory manager accounts
  const filteredStaffList = staffList.filter(staff => 
    staff.role === 'Receptionist' || staff.role === 'InventoryManager'
  );

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
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaffList.map(staff => (
                  <tr key={staff.id}>
                    <td>{staff.name}</td>
                    <td>{staff.role}</td>
                    <td>{staff.department}</td>
                    <td>
                      <span className={`badge bg-${staff.status === 'Active' ? 'success' : 'secondary'}`}>
                        {staff.status}
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

export default StaffAccounts;

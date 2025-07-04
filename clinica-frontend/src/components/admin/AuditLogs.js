import React, { useState } from 'react';

const AuditLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Mock audit log data
  const auditLogs = [
    {
      id: 1,
      timestamp: '2024-02-15T09:30:00',
      user: 'admin@clinica.com',
      action: 'LOGIN',
      description: 'User logged in successfully',
      ipAddress: '192.168.1.100'
    },
    {
      id: 2,
      timestamp: '2024-02-15T10:15:00',
      user: 'dr.smith@clinica.com',
      action: 'UPDATE',
      description: 'Updated patient record #12345',
      ipAddress: '192.168.1.101'
    },
    {
      id: 3,
      timestamp: '2024-02-15T11:00:00',
      user: 'receptionist@clinica.com',
      action: 'CREATE',
      description: 'Created new appointment for patient #67890',
      ipAddress: '192.168.1.102'
    },
    {
      id: 4,
      timestamp: '2024-02-15T11:45:00',
      user: 'admin@clinica.com',
      action: 'DELETE',
      description: 'Deleted expired prescriptions',
      ipAddress: '192.168.1.100'
    }
  ];

  const getActionBadgeClass = (action) => {
    switch(action) {
      case 'LOGIN': return 'bg-info';
      case 'CREATE': return 'bg-success';
      case 'UPDATE': return 'bg-warning text-dark';
      case 'DELETE': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="mb-0">Audit Logs</h5>
        <button className="btn btn-outline-primary">
          <i className="bi bi-download me-2"></i>Export Logs
        </button>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-2">
          <select 
            className="form-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Actions</option>
            <option value="LOGIN">Login</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
          </select>
        </div>
        <div className="col-md-6">
          <div className="input-group">
            <input
              type="date"
              className="form-control"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
            <span className="input-group-text bg-light">to</span>
            <input
              type="date"
              className="form-control"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="bg-light">
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Description</th>
              <th>IP Address</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.map(log => (
              <tr key={log.id}>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
                <td>{log.user}</td>
                <td>
                  <span className={`badge ${getActionBadgeClass(log.action)}`}>
                    {log.action}
                  </span>
                </td>
                <td>{log.description}</td>
                <td>{log.ipAddress}</td>
                <td>
                  <button className="btn btn-sm btn-outline-secondary">
                    <i className="bi bi-eye"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogs;

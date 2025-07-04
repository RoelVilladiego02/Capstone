import React, { useState } from 'react';

const AuditLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const logs = [
    {
      id: 1,
      user: 'admin@clinica.com',
      action: 'LOGIN',
      description: 'User logged in successfully',
      timestamp: '2024-02-15 09:30:00',
      ipAddress: '192.168.1.100'
    },
    {
      id: 2,
      user: 'doctor@clinica.com',
      action: 'UPDATE',
      description: 'Updated patient record #12345',
      timestamp: '2024-02-15 10:15:00',
      ipAddress: '192.168.1.101'
    }
  ];

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
            <span className="input-group-text bg-light">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-3">
          <select 
            className="form-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Actions</option>
            <option value="login">Login</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
          </select>
        </div>
        <div className="col-md-5">
          <div className="input-group">
            <input
              type="date"
              className="form-control"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
            <span className="input-group-text">to</span>
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
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Description</th>
              <th>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td>{log.timestamp}</td>
                <td>{log.user}</td>
                <td>
                  <span className={`badge bg-${
                    log.action === 'LOGIN' ? 'success' :
                    log.action === 'UPDATE' ? 'info' :
                    'danger'
                  }`}>
                    {log.action}
                  </span>
                </td>
                <td>{log.description}</td>
                <td>{log.ipAddress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogs;

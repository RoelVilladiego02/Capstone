import React, { useEffect, useState } from 'react';
import { auditLogService } from '../../services/auditLogService';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    setError(null);
    auditLogService.getLogs({ page })
      .then(data => {
        setLogs(data.data || []);
        setTotalPages(data.last_page || 1);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load audit logs.');
        setLoading(false);
      });
  }, [page]);

  const getActionBadgeClass = (action) => {
    switch(action) {
      case 'LOGIN': return 'bg-info';
      case 'CREATE': return 'bg-success';
      case 'UPDATE': return 'bg-warning text-dark';
      case 'DELETE': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  if (loading) return <div>Loading audit logs...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="mb-0">Audit Logs</h5>
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
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr><td colSpan="5" className="text-center">No audit logs found.</td></tr>
            ) : (
              logs.map(log => (
                <tr key={log.id}>
                  <td>{log.created_at ? new Date(log.created_at).toLocaleString() : ''}</td>
                  <td>{log.user ? `${log.user.name} (${log.user.email})` : 'N/A'}</td>
                  <td>
                    <span className={`badge ${getActionBadgeClass(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td>{log.description}</td>
                  <td>{log.ip_address}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      <div className="d-flex justify-content-center mt-3">
        <nav>
          <ul className="pagination">
            <li className={`page-item${page === 1 ? ' disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage(page - 1)} disabled={page === 1}>Previous</button>
            </li>
            {[...Array(totalPages)].map((_, idx) => (
              <li key={idx+1} className={`page-item${page === idx+1 ? ' active' : ''}`}>
                <button className="page-link" onClick={() => setPage(idx+1)}>{idx+1}</button>
              </li>
            ))}
            <li className={`page-item${page === totalPages ? ' disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage(page + 1)} disabled={page === totalPages}>Next</button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default AuditLogs;

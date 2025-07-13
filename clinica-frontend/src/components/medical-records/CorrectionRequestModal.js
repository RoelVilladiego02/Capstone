import React, { useEffect, useState } from 'react';
import correctionRequestService from '../../services/correctionRequestService';

const CorrectionRequestModal = ({ show, onClose }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newRequest, setNewRequest] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (show) fetchRequests();
    // eslint-disable-next-line
  }, [show]);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await correctionRequestService.getMyRequests();
      console.log('Correction requests response:', res);
      setRequests(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Error fetching correction requests:', err);
      setError('Failed to load requests: ' + (err.message || 'Unknown error'));
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newRequest.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await correctionRequestService.create({ request: newRequest });
      setNewRequest('');
      fetchRequests();
    } catch (err) {
      setError('Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this request?')) return;
    try {
      await correctionRequestService.delete(id);
      fetchRequests();
    } catch {
      setError('Failed to delete request');
    }
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Correction Requests</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit} className="mb-4">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Describe the correction you need..."
                  value={newRequest}
                  onChange={e => setNewRequest(e.target.value)}
                  disabled={submitting}
                  maxLength={500}
                  required
                />
                <button className="btn btn-primary" type="submit" disabled={submitting || !newRequest.trim()}>
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
            <h6>Your Previous Requests</h6>
            {loading ? (
              <div>Loading...</div>
            ) : requests.length === 0 ? (
              <div className="text-muted">No requests yet.</div>
            ) : (
              <ul className="list-group">
                {requests.map(req => (
                  <li key={req.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <div>{req.request}</div>
                      <small className="text-muted">Status: {req.status}</small>
                      {req.admin_response && (
                        <div><small className="text-success">Admin: {req.admin_response}</small></div>
                      )}
                    </div>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(req.id)}>
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorrectionRequestModal; 
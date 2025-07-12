import React, { useEffect, useState, useRef } from 'react';
import uploadedDocumentService from '../../services/uploadedDocumentService';

const UploadedDocumentModal = ({ show, onClose }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [type, setType] = useState('');
  const fileInputRef = useRef();

  useEffect(() => {
    if (show) fetchDocuments();
    // eslint-disable-next-line
  }, [show]);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await uploadedDocumentService.getMyDocuments();
      setDocuments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError('Failed to load documents');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (type) formData.append('type', type);
      await uploadedDocumentService.upload(formData);
      setFile(null);
      setType('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchDocuments();
    } catch (err) {
      setError('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await uploadedDocumentService.delete(id);
      fetchDocuments();
    } catch {
      setError('Failed to delete document');
    }
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Uploaded Documents</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleUpload} className="mb-4">
              <div className="row g-2 align-items-center">
                <div className="col-md-5">
                  <input
                    type="file"
                    className="form-control"
                    ref={fileInputRef}
                    onChange={e => setFile(e.target.files[0])}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.txt"
                    required
                  />
                </div>
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Type (e.g., Lab Result)"
                    value={type}
                    onChange={e => setType(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <button className="btn btn-success w-100" type="submit" disabled={uploading || !file}>
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </div>
            </form>
            <h6>Your Uploaded Documents</h6>
            {loading ? (
              <div>Loading...</div>
            ) : !Array.isArray(documents) || documents.length === 0 ? (
              <div className="text-muted">No documents uploaded yet.</div>
            ) : (
              <ul className="list-group">
                {documents.map(doc => (
                  <li key={doc.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <div><strong>{doc.original_name}</strong> {doc.type && <span className="badge bg-info ms-2">{doc.type}</span>}</div>
                      <small className="text-muted">Uploaded: {new Date(doc.created_at).toLocaleString()}</small>
                    </div>
                    <div>
                      <a
                        href={process.env.REACT_APP_API_URL.replace('/api', '') + '/storage/' + doc.file_path}
                        className="btn btn-sm btn-outline-primary me-2"
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                      >
                        Download
                      </a>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(doc.id)}>
                        Delete
                      </button>
                    </div>
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

export default UploadedDocumentModal; 
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { patientService } from '../../services/patientService';
import { normalizePatient } from '../../utils/patientUtils';

const PatientsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState({ field: 'lastVisit', direction: 'desc' });
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const itemsPerPage = 10;

  // Fetch patients data
  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      const data = await patientService.getPatients();
      console.log('Patients data from API:', data);
      // Normalize all patient data
      const normalizedPatients = data.map(patient => normalizePatient(patient));
      console.log('Normalized patients:', normalizedPatients);
      setPatients(normalizedPatients);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Filter and sort patients
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone?.includes(searchTerm);
    return matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const currentPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field) => {
    setSortBy(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Patient Directory</h4>
          <p className="text-muted mb-0">Manage and view patient information</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary">
            <i className="bi bi-download me-2"></i>Export List
          </button>
          <Link to="/patients/register" className="btn" style={{ backgroundColor: '#E31937', color: 'white' }}>
            <i className="bi bi-plus-lg me-2"></i>Add Patient
          </Link>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3">
          <div className="row g-3 align-items-center">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-2">
              <select 
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                    Patient Name
                    {sortBy.field === 'name' && (
                      <i className={`bi bi-chevron-${sortBy.direction === 'asc' ? 'up' : 'down'} ms-1`}></i>
                    )}
                  </th>
                  <th>Contact</th>
                  <th>DOB</th>
                  <th>Gender</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentPatients.map(patient => (
                  <tr key={patient.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="avatar-circle me-2">
                          {patient.name.charAt(0)}
                        </div>
                        <div>
                          <div className="fw-medium">{patient.name}</div>
                          <small className="text-muted">
                            ID: {patient.id}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>{patient.phone}</td>
                    <td>{patient.dob ? new Date(patient.dob).toLocaleDateString() : 'N/A'}</td>
                    <td>{patient.gender}</td>
                    <td>{patient.address}</td>
                    <td>
                      <Link 
                        to={`${patient.id}`}
                        className="btn btn-sm btn-outline-primary"
                      >
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card-footer bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <small className="text-muted">
                Showing {Math.min(itemsPerPage, filteredPatients.length)} of {filteredPatients.length} patients
              </small>
            </div>
            <nav>
              <ul className="pagination mb-0">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => setCurrentPage(prev => prev - 1)}
                  >
                    Previous
                  </button>
                </li>
                {[...Array(totalPages)].map((_, i) => (
                  <li 
                    key={i} 
                    className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}
                  >
                    <button 
                      className="page-link"
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientsList;


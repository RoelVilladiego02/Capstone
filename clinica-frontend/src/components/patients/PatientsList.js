import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const PatientsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState({ field: 'lastVisit', direction: 'desc' });
  const itemsPerPage = 10;

  // Mock data - replace with API call
  const patients = [
    { 
      id: 1, 
      name: 'John Doe', 
      age: 45, 
      gender: 'Male',
      contactNumber: '+1234567890',
      lastVisit: '2024-02-15',
      nextAppointment: '2024-03-01',
      status: 'Active',
      doctor: 'Dr. Smith',
      medicalConditions: ['Hypertension', 'Diabetes'],
      image: 'https://via.placeholder.com/40'
    },
    { 
      id: 2, 
      name: 'Jane Smith', 
      age: 32, 
      gender: 'Female',
      contactNumber: '+1234567891',
      lastVisit: '2024-02-14',
      nextAppointment: '2024-02-28',
      status: 'Active',
      doctor: 'Dr. Johnson',
      medicalConditions: ['Asthma'],
      image: 'https://via.placeholder.com/40'
    },
    { 
      id: 3, 
      name: 'Maria Garcia', 
      age: 28, 
      gender: 'Female',
      contactNumber: '+1234567892',
      lastVisit: '2024-02-10',
      nextAppointment: '2024-03-05',
      status: 'Active',
      doctor: 'Dr. Williams',
      medicalConditions: ['Allergies'],
      image: 'https://via.placeholder.com/40'
    },
    { 
      id: 4, 
      name: 'Robert Wilson', 
      age: 52, 
      gender: 'Male',
      contactNumber: '+1234567893',
      lastVisit: '2024-01-20',
      nextAppointment: null,
      status: 'Inactive',
      doctor: 'Dr. Smith',
      medicalConditions: ['Arthritis'],
      image: 'https://via.placeholder.com/40'
    },
    { 
      id: 5, 
      name: 'Sarah Johnson', 
      age: 41, 
      gender: 'Female',
      contactNumber: '+1234567894',
      lastVisit: '2024-02-13',
      nextAppointment: '2024-03-10',
      status: 'Active',
      doctor: 'Dr. Brown',
      medicalConditions: ['Migraine'],
      image: 'https://via.placeholder.com/40'
    },
    { 
      id: 6, 
      name: 'Michael Brown', 
      age: 63, 
      gender: 'Male',
      contactNumber: '+1234567895',
      lastVisit: '2024-02-01',
      nextAppointment: '2024-02-25',
      status: 'Critical',
      doctor: 'Dr. Johnson',
      medicalConditions: ['Heart Disease', 'Diabetes'],
      image: 'https://via.placeholder.com/40'
    },
    { 
      id: 7, 
      name: 'Emily Davis', 
      age: 29, 
      gender: 'Female',
      contactNumber: '+1234567896',
      lastVisit: '2024-02-12',
      nextAppointment: '2024-03-15',
      status: 'Active',
      doctor: 'Dr. Williams',
      medicalConditions: ['Anxiety'],
      image: 'https://via.placeholder.com/40'
    },
    { 
      id: 8, 
      name: 'David Martinez', 
      age: 47, 
      gender: 'Male',
      contactNumber: '+1234567897',
      lastVisit: '2024-01-30',
      nextAppointment: '2024-02-27',
      status: 'Active',
      doctor: 'Dr. Smith',
      medicalConditions: ['Hypertension'],
      image: 'https://via.placeholder.com/40'
    },
    { 
      id: 9, 
      name: 'Lisa Anderson', 
      age: 35, 
      gender: 'Female',
      contactNumber: '+1234567898',
      lastVisit: '2024-02-08',
      nextAppointment: '2024-03-08',
      status: 'Active',
      doctor: 'Dr. Brown',
      medicalConditions: ['Depression'],
      image: 'https://via.placeholder.com/40'
    },
    { 
      id: 10, 
      name: 'James Wilson', 
      age: 58, 
      gender: 'Male',
      contactNumber: '+1234567899',
      lastVisit: '2024-01-25',
      nextAppointment: null,
      status: 'Inactive',
      doctor: 'Dr. Johnson',
      medicalConditions: ['COPD'],
      image: 'https://via.placeholder.com/40'
    },
    { 
      id: 11, 
      name: 'Patricia Moore', 
      age: 39, 
      gender: 'Female',
      contactNumber: '+1234567900',
      lastVisit: '2024-02-11',
      nextAppointment: '2024-03-12',
      status: 'Active',
      doctor: 'Dr. Williams',
      medicalConditions: ['Thyroid'],
      image: 'https://via.placeholder.com/40'
    },
    { 
      id: 12, 
      name: 'Thomas Taylor', 
      age: 51, 
      gender: 'Male',
      contactNumber: '+1234567901',
      lastVisit: '2024-02-05',
      nextAppointment: '2024-03-05',
      status: 'Active',
      doctor: 'Dr. Smith',
      medicalConditions: ['High Cholesterol'],
      image: 'https://via.placeholder.com/40'
    },
    { 
      id: 13, 
      name: 'Jessica Lee', 
      age: 31, 
      gender: 'Female',
      contactNumber: '+1234567902',
      lastVisit: '2024-02-14',
      nextAppointment: '2024-03-14',
      status: 'Active',
      doctor: 'Dr. Brown',
      medicalConditions: ['Endometriosis'],
      image: 'https://via.placeholder.com/40'
    },
    { 
      id: 14, 
      name: 'Christopher White', 
      age: 44, 
      gender: 'Male',
      contactNumber: '+1234567903',
      lastVisit: '2024-01-28',
      nextAppointment: '2024-02-28',
      status: 'Critical',
      doctor: 'Dr. Johnson',
      medicalConditions: ['Kidney Disease'],
      image: 'https://via.placeholder.com/40'
    },
    { 
      id: 15, 
      name: 'Amanda Harris', 
      age: 33, 
      gender: 'Female',
      contactNumber: '+1234567904',
      lastVisit: '2024-02-09',
      nextAppointment: '2024-03-09',
      status: 'Active',
      doctor: 'Dr. Williams',
      medicalConditions: ['Gastritis'],
      image: 'https://via.placeholder.com/40'
    },
    { 
      id: 16, 
      name: 'Kevin Clark', 
      age: 49, 
      gender: 'Male',
      contactNumber: '+1234567905',
      lastVisit: '2024-02-07',
      nextAppointment: '2024-03-07',
      status: 'Active',
      doctor: 'Dr. Smith',
      medicalConditions: ['Back Pain'],
      image: 'https://via.placeholder.com/40'
    },
    { 
      id: 17, 
      name: 'Michelle Rodriguez', 
      age: 36, 
      gender: 'Female',
      contactNumber: '+1234567906',
      lastVisit: '2024-02-13',
      nextAppointment: '2024-03-13',
      status: 'Active',
      doctor: 'Dr. Brown',
      medicalConditions: ['Fibromyalgia'],
      image: 'https://via.placeholder.com/40'
    },
    { 
      id: 18, 
      name: 'Daniel Lewis', 
      age: 55, 
      gender: 'Male',
      contactNumber: '+1234567907',
      lastVisit: '2024-01-15',
      nextAppointment: null,
      status: 'Inactive',
      doctor: 'Dr. Johnson',
      medicalConditions: ['Gout'],
      image: 'https://via.placeholder.com/40'
    },
    { 
      id: 19, 
      name: 'Elizabeth Martin', 
      age: 42, 
      gender: 'Female',
      contactNumber: '+1234567908',
      lastVisit: '2024-02-06',
      nextAppointment: '2024-03-06',
      status: 'Active',
      doctor: 'Dr. Williams',
      medicalConditions: ['Osteoporosis'],
      image: 'https://via.placeholder.com/40'
    },
    { 
      id: 20, 
      name: 'Richard Thompson', 
      age: 61, 
      gender: 'Male',
      contactNumber: '+1234567909',
      lastVisit: '2024-02-04',
      nextAppointment: '2024-03-04',
      status: 'Active',
      doctor: 'Dr. Smith',
      medicalConditions: ['Glaucoma'],
      image: 'https://via.placeholder.com/40'
    }
  ];

  // Filter and sort patients
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.contactNumber.includes(searchTerm) ||
      patient.doctor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || patient.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    const direction = sortBy.direction === 'asc' ? 1 : -1;
    return a[sortBy.field] > b[sortBy.field] ? direction : -direction;
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

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'Active': return 'bg-success';
      case 'Inactive': return 'bg-secondary';
      case 'Critical': return 'bg-danger';
      default: return 'bg-primary';
    }
  };

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
                  <th>Last Visit</th>
                  <th>Next Appointment</th>
                  <th>Doctor</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentPatients.map(patient => (
                  <tr key={patient.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <img 
                          src={patient.image} 
                          alt={patient.name}
                          className="rounded-circle me-2"
                          width="40"
                          height="40"
                        />
                        <div>
                          <div className="fw-medium">{patient.name}</div>
                          <small className="text-muted">
                            {patient.age} yrs • {patient.gender}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>{patient.contactNumber}</td>
                    <td>
                      {new Date(patient.lastVisit).toLocaleDateString()}
                    </td>
                    <td>
                      {patient.nextAppointment ? (
                        new Date(patient.nextAppointment).toLocaleDateString()
                      ) : (
                        <span className="text-muted">No appointment</span>
                      )}
                    </td>
                    <td>{patient.doctor}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(patient.status)}`}>
                        {patient.status}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group">
                        <Link 
                          to={`/patients/${patient.id}`}
                          className="btn btn-sm btn-outline-primary"
                        >
                          View Profile
                        </Link>
                        <button 
                          type="button" 
                          className="btn btn-sm btn-outline-primary dropdown-toggle dropdown-toggle-split"
                          data-bs-toggle="dropdown"
                        >
                          <span className="visually-hidden">Toggle Dropdown</span>
                        </button>
                        <ul className="dropdown-menu">
                          <li>
                            <button className="dropdown-item">
                              <i className="bi bi-calendar-plus me-2"></i>Schedule Appointment
                            </button>
                          </li>
                          <li>
                            <button className="dropdown-item">
                              <i className="bi bi-file-earmark-text me-2"></i>View Records
                            </button>
                          </li>
                          <li><hr className="dropdown-divider" /></li>
                          <li>
                            <button className="dropdown-item text-danger">
                              <i className="bi bi-trash me-2"></i>Delete
                            </button>
                          </li>
                        </ul>
                      </div>
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

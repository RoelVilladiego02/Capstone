import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const MedicalRecords = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const [activeTab, setActiveTab] = useState('consultations');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const records = {
    consultations: [
      {
        id: 1,
        date: '2024-02-15',
        doctor: 'Dr. Smith',
        diagnosis: 'Upper Respiratory Infection',
        symptoms: ['Fever', 'Cough', 'Sore throat'],
        vitals: {
          temperature: '38.2°C',
          bloodPressure: '120/80', 
          heartRate: '88',
          respiratoryRate: '16'
        },
        treatment: 'Prescribed antibiotics and rest',
        followUp: '2024-02-22'
      }
    ],
    labResults: [
      {
        id: 1,
        date: '2024-02-10',
        type: 'Blood Test',
        doctor: 'Dr. Johnson',
        status: 'Completed',
        results: {
          hemoglobin: '14.5 g/dL',
          whiteBloodCells: '7.5 x10^9/L',
          platelets: '250 x10^9/L'
        },
        notes: 'Within normal range'
      }
    ],
    medications: [
      {
        id: 1,
        name: 'Amoxicillin',
        dosage: '500mg',
        frequency: '3 times daily',
        startDate: '2024-02-15',
        endDate: '2024-02-22',
        prescribedBy: 'Dr. Smith',
        status: 'Active'
      }
    ],
    immunizations: [
      {
        id: 1,
        vaccine: 'Influenza Vaccine',
        date: '2024-01-15',
        administrator: 'Nurse Wilson',
        nextDue: '2025-01-15'
      }
    ]
  };

  const filterRecords = (recordsList) => {
    return recordsList.filter(record => {
      const matchesSearch = 
        Object.values(record).some(value => 
          value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      const matchesDate = !filterDate || record.date === filterDate;
      return matchesSearch && matchesDate;
    });
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Medical Records</h4>
          <p className="text-muted mb-0">View and manage your medical history</p>
        </div>
        <div>
          <button className="btn btn-outline-primary me-2">
            <i className="bi bi-download me-2"></i>
            Export Records
          </button>
          <button className="btn" style={{ backgroundColor: '#E31937', color: 'white' }}>
            <i className="bi bi-plus-lg me-2"></i>
            Add Record
          </button>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white">
          <div className="row g-3 align-items-center">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <input
                type="date"
                className="form-control"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
            <div className="col">
              <ul className="nav nav-tabs card-header-tabs">
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'consultations' ? 'active' : ''}`}
                    onClick={() => setActiveTab('consultations')}
                  >
                    Consultations
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'labResults' ? 'active' : ''}`}
                    onClick={() => setActiveTab('labResults')}
                  >
                    Lab Results
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'medications' ? 'active' : ''}`}
                    onClick={() => setActiveTab('medications')}
                  >
                    Medications
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'immunizations' ? 'active' : ''}`}
                    onClick={() => setActiveTab('immunizations')}
                  >
                    Immunizations
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="card-body">
          {/* Content based on active tab */}
          {activeTab === 'consultations' && (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Doctor</th>
                    <th>Diagnosis</th>
                    <th>Vitals</th>
                    <th>Follow-up</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filterRecords(records.consultations).map(record => (
                    <tr key={record.id}>
                      <td>{new Date(record.date).toLocaleDateString()}</td>
                      <td>{record.doctor}</td>
                      <td>
                        <div>{record.diagnosis}</div>
                        <small className="text-muted">
                          Symptoms: {record.symptoms.join(', ')}
                        </small>
                      </td>
                      <td>
                        <small>
                          <div>Temp: {record.vitals.temperature}</div>
                          <div>BP: {record.vitals.bloodPressure}</div>
                        </small>
                      </td>
                      <td>{new Date(record.followUp).toLocaleDateString()}</td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary me-2">
                          <i className="bi bi-eye"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-secondary">
                          <i className="bi bi-download"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Add similar sections for other tabs */}
        </div>
      </div>
    </div>
  );
};

export default MedicalRecords;

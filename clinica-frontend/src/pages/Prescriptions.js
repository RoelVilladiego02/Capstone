import React, { useState } from 'react';

const Prescriptions = () => {
  const [activeTab, setActiveTab] = useState('current');

  const prescriptions = [
    {
      id: 1,
      date: '2024-02-15',
      doctor: 'Dr. Smith',
      medications: [
        {
          name: 'Amoxicillin',
          dosage: '500mg',
          frequency: '3 times daily',
          duration: '7 days',
          instructions: 'Take with food',
          status: 'Active'
        }
      ],
      diagnosis: 'Upper Respiratory Infection',
      nextCheckup: '2024-02-22',
      status: 'Active'
    },
    {
      id: 2,
      date: '2024-01-20',
      doctor: 'Dr. Johnson',
      medications: [
        {
          name: 'Paracetamol',
          dosage: '500mg',
          frequency: 'As needed',
          duration: '5 days',
          instructions: 'Take for fever above 38°C',
          status: 'Completed'
        }
      ],
      diagnosis: 'Viral Fever',
      nextCheckup: '2024-01-25',
      status: 'Completed'
    }
  ];

  const filteredPrescriptions = prescriptions.filter(
    presc => activeTab === 'all' || 
    (activeTab === 'current' && presc.status === 'Active') ||
    (activeTab === 'past' && presc.status === 'Completed')
  );

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-0">Prescriptions</h4>
          <p className="text-muted">View and manage your prescriptions</p>
        </div>
        <button className="btn" style={{ backgroundColor: '#E31937', color: 'white' }}>
          <i className="bi bi-plus-lg me-2"></i>Request Refill
        </button>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'current' ? 'active' : ''}`}
                onClick={() => setActiveTab('current')}
              >
                Current Prescriptions
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'past' ? 'active' : ''}`}
                onClick={() => setActiveTab('past')}
              >
                Past Prescriptions
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All
              </button>
            </li>
          </ul>
        </div>

        <div className="card-body">
          {filteredPrescriptions.map(prescription => (
            <div key={prescription.id} className="prescription-card mb-4">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="card-title mb-1">{prescription.diagnosis}</h5>
                      <p className="text-muted mb-0">
                        Prescribed by {prescription.doctor} on {new Date(prescription.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`badge bg-${prescription.status === 'Active' ? 'success' : 'secondary'}`}>
                      {prescription.status}
                    </span>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <thead className="table-light">
                        <tr>
                          <th>Medication</th>
                          <th>Dosage</th>
                          <th>Frequency</th>
                          <th>Duration</th>
                          <th>Special Instructions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {prescription.medications.map((med, index) => (
                          <tr key={index}>
                            <td>{med.name}</td>
                            <td>{med.dosage}</td>
                            <td>{med.frequency}</td>
                            <td>{med.duration}</td>
                            <td>{med.instructions}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-3">
                    <small className="text-muted">
                      <i className="bi bi-calendar-event me-2"></i>
                      Next check-up: {new Date(prescription.nextCheckup).toLocaleDateString()}
                    </small>
                  </div>

                  <div className="mt-3">
                    <button className="btn btn-sm btn-outline-primary me-2">
                      <i className="bi bi-printer me-1"></i>Print
                    </button>
                    <button className="btn btn-sm btn-outline-primary me-2">
                      <i className="bi bi-download me-1"></i>Download
                    </button>
                    {prescription.status === 'Active' && (
                      <button className="btn btn-sm btn-outline-success">
                        <i className="bi bi-arrow-clockwise me-1"></i>Request Refill
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Prescriptions;

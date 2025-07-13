import React, { useState, useEffect } from 'react';
import { prescriptionService } from '../services/prescriptionService';
import { patientService } from '../services/patientService';
import { extractPatientId } from '../utils/patientUtils';

const Prescriptions = () => {
  const [activeTab, setActiveTab] = useState('current');
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patientId, setPatientId] = useState(null);
  const [refillLoading, setRefillLoading] = useState({});
  const [message, setMessage] = useState(null);

  // Fetch patient ID from /patients/me on mount
  useEffect(() => {
    const fetchPatientId = async () => {
      try {
        const data = await patientService.getMyProfile();
        console.log('Patient profile data:', data);
        
        const id = extractPatientId(data);
        console.log('Extracted patient ID:', id);
        
        if (!id) {
          setError('Unable to retrieve patient profile. Please contact support.');
          setLoading(false);
          return;
        }
        
        setPatientId(id);
      } catch (err) {
        console.error('Error fetching patient id:', err);
        setError('Failed to load patient profile. Please try again.');
        setLoading(false);
      }
    };
    fetchPatientId();
  }, []);

  // Fetch prescriptions when patientId is available
  useEffect(() => {
    if (patientId) {
      fetchPrescriptions();
    }
  }, [patientId]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      console.log('Fetching prescriptions for patient ID:', patientId);
      
      const data = await prescriptionService.getByPatient(patientId);
      console.log('Raw prescription data:', data);
      
      // Transform the data to match the expected format
      const transformedPrescriptions = (Array.isArray(data) ? data : []).map(prescription => ({
        id: prescription.id,
        date: prescription.date,
        doctor: prescription.doctor?.name || 'Dr. Unknown',
        medications: prescription.medications || [],
        diagnosis: prescription.diagnosis,
        nextCheckup: prescription.next_checkup,
        status: prescription.status || 'Active'
      }));
      
      console.log('Transformed prescriptions:', transformedPrescriptions);
      setPrescriptions(transformedPrescriptions);
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
      setError(`Failed to load prescriptions: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredPrescriptions = prescriptions.filter(
    presc => activeTab === 'all' || 
    (activeTab === 'current' && presc.status === 'Active') ||
    (activeTab === 'past' && presc.status === 'Completed')
  );

  // Handle prescription refill request
  const handleRefillRequest = async (prescriptionId) => {
    try {
      setRefillLoading(prev => ({ ...prev, [prescriptionId]: true }));
      const response = await prescriptionService.requestRefill(prescriptionId);
      setMessage({ type: 'success', text: response.message });
      setTimeout(() => setMessage(null), 5000);
    } catch (err) {
      console.error('Error requesting refill:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to request refill' });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setRefillLoading(prev => ({ ...prev, [prescriptionId]: false }));
    }
  };

  // Handle print prescription
  const handlePrint = (prescription) => {
    const printWindow = window.open('', '_blank');
    const printContent = `
      <html>
        <head>
          <title>Prescription - ${prescription.diagnosis}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .prescription-info { margin-bottom: 20px; }
            .medications { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .footer { margin-top: 30px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Medical Prescription</h1>
          </div>
          <div class="prescription-info">
            <p><strong>Patient:</strong> ${prescription.patient || 'N/A'}</p>
            <p><strong>Doctor:</strong> ${prescription.doctor}</p>
            <p><strong>Date:</strong> ${new Date(prescription.date).toLocaleDateString()}</p>
            <p><strong>Diagnosis:</strong> ${prescription.diagnosis}</p>
          </div>
          <div class="medications">
            <h3>Medications</h3>
            <table>
              <thead>
                <tr>
                  <th>Medication</th>
                  <th>Dosage</th>
                  <th>Frequency</th>
                  <th>Duration</th>
                  <th>Instructions</th>
                </tr>
              </thead>
              <tbody>
                ${prescription.medications.map(med => `
                  <tr>
                    <td>${med.name}</td>
                    <td>${med.dosage}</td>
                    <td>${med.frequency}</td>
                    <td>${med.duration}</td>
                    <td>${med.instructions || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ${prescription.nextCheckup ? `
            <div class="footer">
              <p><strong>Next Check-up:</strong> ${new Date(prescription.nextCheckup).toLocaleDateString()}</p>
            </div>
          ` : ''}
        </body>
      </html>
    `;
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  // Handle download prescription as PDF
  const handleDownload = (prescription) => {
    // Create a simple text version for download
    const content = `
PRESCRIPTION

Patient: ${prescription.patient || 'N/A'}
Doctor: ${prescription.doctor}
Date: ${new Date(prescription.date).toLocaleDateString()}
Diagnosis: ${prescription.diagnosis}

MEDICATIONS:
${prescription.medications.map(med => `
- ${med.name}
  Dosage: ${med.dosage}
  Frequency: ${med.frequency}
  Duration: ${med.duration}
  Instructions: ${med.instructions || 'None'}
`).join('')}

${prescription.nextCheckup ? `Next Check-up: ${new Date(prescription.nextCheckup).toLocaleDateString()}` : ''}
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prescription-${prescription.id}-${new Date(prescription.date).toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
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

  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger" role="alert">
          <h5>Error Loading Prescriptions</h5>
          <p>{error}</p>
          <hr />
          <p><strong>Debug Info:</strong></p>
          <p>Patient ID: {patientId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {message && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`} role="alert">
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage(null)}></button>
        </div>
      )}
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-0">Prescriptions</h4>
          <p className="text-muted">View and manage your prescriptions</p>
        </div>
        <button 
          className="btn" 
          style={{ backgroundColor: '#E31937', color: 'white' }}
          onClick={() => {
            const activePrescriptions = prescriptions.filter(p => p.status === 'Active');
            if (activePrescriptions.length > 0) {
              handleRefillRequest(activePrescriptions[0].id);
            } else {
              setMessage({ type: 'error', text: 'No active prescriptions available for refill' });
              setTimeout(() => setMessage(null), 5000);
            }
          }}
        >
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
          {filteredPrescriptions.length > 0 ? (
            filteredPrescriptions.map(prescription => (
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
                              <td>{med.instructions || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {prescription.nextCheckup && (
                      <div className="mt-3">
                        <small className="text-muted">
                          <i className="bi bi-calendar-event me-2"></i>
                          Next check-up: {new Date(prescription.nextCheckup).toLocaleDateString()}
                        </small>
                      </div>
                    )}

                    <div className="mt-3">
                      <button 
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => handlePrint(prescription)}
                      >
                        <i className="bi bi-printer me-1"></i>Print
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => handleDownload(prescription)}
                      >
                        <i className="bi bi-download me-1"></i>Download
                      </button>
                      {prescription.status === 'Active' && (
                        <button 
                          className="btn btn-sm btn-outline-success"
                          onClick={() => handleRefillRequest(prescription.id)}
                          disabled={refillLoading[prescription.id]}
                        >
                          {refillLoading[prescription.id] ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                              Requesting...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-arrow-clockwise me-1"></i>Request Refill
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <i className="bi bi-prescription fs-1 text-muted d-block mb-3"></i>
              <p className="text-muted">No prescriptions found</p>
              <small className="text-muted">Patient ID: {patientId}</small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Prescriptions;

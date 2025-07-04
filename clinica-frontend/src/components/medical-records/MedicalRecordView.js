import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';

const MedicalRecordView = () => {
  const { patientId } = useParams();
  const [activeTab, setActiveTab] = useState('history');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Mock patient data - In real app, fetch from API
  const patientRecord = {
    id: patientId || '1',
    name: 'John Doe',
    age: 45,
    bloodType: 'O+',
    history: {
      conditions: ['Hypertension', 'Type 2 Diabetes'],
      allergies: ['Penicillin', 'Peanuts'],
      surgeries: [
        { date: '2023-05-15', procedure: 'Appendectomy', surgeon: 'Dr. Smith' },
        { date: '2022-08-20', procedure: 'Knee Arthroscopy', surgeon: 'Dr. Johnson' }
      ]
    },
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
        treatment: 'Prescribed antibiotics',
        notes: 'Follow up in 1 week',
        prescriptions: ['Amoxicillin 500mg', 'Paracetamol 500mg']
      },
      {
        id: 2,
        date: '2024-01-20',
        doctor: 'Dr. Johnson',
        diagnosis: 'Routine Check-up',
        symptoms: [],
        vitals: {
          temperature: '36.6°C',
          bloodPressure: '118/78',
          heartRate: '72',
          respiratoryRate: '14'
        },
        treatment: 'No acute concerns',
        notes: 'Schedule next check-up in 6 months',
        prescriptions: []
      }
    ]
  };

  // Filter records based on search and date
  const filteredRecords = useMemo(() => {
    const records = activeTab === 'consultations' ? patientRecord.consultations : [];

    return records.filter(record => {
      const matchesSearch = Object.values(record).some(value =>
        value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesDate = !filterDate || record.date === filterDate;
      return matchesSearch && matchesDate;
    });
  }, [activeTab, searchTerm, filterDate, patientRecord.consultations]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Completed':
        return 'badge bg-success';
      case 'Pending':
        return 'badge bg-warning text-dark';
      case 'Cancelled':
        return 'badge bg-danger';
      default:
        return '';
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Patient Summary Card */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-2">
              <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" 
                   style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                {patientRecord.name.charAt(0)}
              </div>
            </div>
            <div className="col-md-10">
              <h4 className="mb-2">{patientRecord.name}</h4>
              <div className="row">
                <div className="col-md-3">
                  <p className="mb-1"><strong>Age:</strong> {patientRecord.age}</p>
                </div>
                <div className="col-md-3">
                  <p className="mb-1"><strong>Blood Type:</strong> {patientRecord.bloodType}</p>
                </div>
                <div className="col-md-6">
                  <p className="mb-1"><strong>Conditions:</strong> {patientRecord.history.conditions.join(', ')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="card border-0 shadow-sm">
        <div className="card-header">
          <div className="row g-3">
            <div className="col-md-6">
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
              <select className="form-select" value={filterDate} onChange={(e) => setFilterDate(e.target.value)}>
                <option value="">Filter by date</option>
                <option value="2024-02-15">2024-02-15</option>
                <option value="2024-01-20">2024-01-20</option>
              </select>
            </div>
            <div className="col-md-3">
              <button className="btn w-100" style={{ backgroundColor: '#E31937', color: 'white' }}>
                <i className="bi bi-plus-lg me-2"></i>Add New Record
              </button>
            </div>
          </div>

          <ul className="nav nav-tabs card-header-tabs mt-3">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                Medical History
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'consultations' ? 'active' : ''}`}
                onClick={() => setActiveTab('consultations')}
              >
                Consultations
              </button>
            </li>
          </ul>
        </div>

        <div className="card-body">
          {activeTab === 'history' && (
            <div className="row">
              <div className="col-md-6 mb-4">
                <h6 className="fw-bold mb-3">Medical Conditions</h6>
                <ul className="list-group">
                  {patientRecord.history.conditions.map((condition, index) => (
                    <li key={index} className="list-group-item">
                      <i className="bi bi-activity text-danger me-2"></i>
                      {condition}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="col-md-6 mb-4">
                <h6 className="fw-bold mb-3">Allergies</h6>
                <ul className="list-group">
                  {patientRecord.history.allergies.map((allergy, index) => (
                    <li key={index} className="list-group-item">
                      <i className="bi bi-exclamation-triangle text-warning me-2"></i>
                      {allergy}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="col-12">
                <h6 className="fw-bold mb-3">Surgical History</h6>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Procedure</th>
                        <th>Surgeon</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patientRecord.history.surgeries.map((surgery, index) => (
                        <tr key={index}>
                          <td>{new Date(surgery.date).toLocaleDateString()}</td>
                          <td>{surgery.procedure}</td>
                          <td>{surgery.surgeon}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'consultations' && (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Doctor</th>
                    <th>Diagnosis</th>
                    <th>Symptoms</th>
                    <th>Vitals</th>
                    <th>Treatment</th>
                    <th>Notes</th>
                    <th>Prescriptions</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record, index) => (
                    <tr key={index}>
                      <td>{new Date(record.date).toLocaleDateString()}</td>
                      <td>{record.doctor}</td>
                      <td>{record.diagnosis}</td>
                      <td>{record.symptoms.join(', ')}</td>
                      <td>
                        Temp: {record.vitals.temperature} <br />
                        BP: {record.vitals.bloodPressure} <br />
                        HR: {record.vitals.heartRate} <br />
                        RR: {record.vitals.respiratoryRate}
                      </td>
                      <td>{record.treatment}</td>
                      <td>{record.notes}</td>
                      <td>{record.prescriptions.join(', ')}</td>
                      <td>
                        <span className={getStatusBadgeClass(record.status)}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalRecordView;

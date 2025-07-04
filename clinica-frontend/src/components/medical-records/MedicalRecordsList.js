import React from 'react';

const MedicalRecordsList = ({ records }) => {
  return (
    <div className="card mt-3">
      <div className="card-body">
        <h5 className="card-title">Medical History</h5>
        {records.map(record => (
          <div key={record.id} className="medical-record">
            <p><strong>Date:</strong> {record.date}</p>
            <p><strong>Diagnosis:</strong> {record.diagnosis}</p>
            <p><strong>Treatment:</strong> {record.treatment}</p>
            <p><strong>Doctor:</strong> {record.doctor}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MedicalRecordsList;

import React from 'react';

const MedicalRecordsList = ({ records }) => {
  const formatVitalSigns = (vitalSigns) => {
    if (!vitalSigns) return 'N/A';
    
    const vitals = typeof vitalSigns === 'string' ? JSON.parse(vitalSigns) : vitalSigns;
    return (
      <div>
        {vitals.temperature && <div>Temp: {vitals.temperature}</div>}
        {vitals.blood_pressure && <div>BP: {vitals.blood_pressure}</div>}
        {vitals.heart_rate && <div>HR: {vitals.heart_rate}</div>}
        {vitals.respiratory_rate && <div>RR: {vitals.respiratory_rate}</div>}
        {vitals.oxygen_saturation && <div>O2: {vitals.oxygen_saturation}</div>}
      </div>
    );
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Active':
        return 'badge bg-success';
      case 'Completed':
        return 'badge bg-primary';
      case 'Pending':
        return 'badge bg-warning text-dark';
      case 'Cancelled':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  };

  if (!records || records.length === 0) {
    return (
      <div className="card mt-3">
        <div className="card-body">
          <h5 className="card-title">Medical History</h5>
          <p className="text-muted">No medical records found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card mt-3">
      <div className="card-body">
        <h5 className="card-title">Medical History</h5>
        {records.map(record => (
          <div key={record.id} className="medical-record border-bottom pb-3 mb-3">
            <div className="row">
              <div className="col-md-8">
                <h6 className="mb-2">
                  {new Date(record.visit_date).toLocaleDateString()} - {record.doctor?.name || 'N/A'}
                </h6>
                <p className="mb-1"><strong>Diagnosis:</strong> {record.diagnosis}</p>
                <p className="mb-1"><strong>Treatment:</strong> {record.treatment}</p>
                {record.notes && (
                  <p className="mb-1"><strong>Notes:</strong> {record.notes}</p>
                )}
              </div>
              <div className="col-md-4">
                <div className="mb-2">
                  <strong>Vital Signs:</strong>
                  <small className="d-block">
                    {formatVitalSigns(record.vital_signs)}
                  </small>
                </div>
                <span className={getStatusBadgeClass(record.status)}>
                  {record.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MedicalRecordsList;

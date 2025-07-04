import React from 'react';

const GeneralSettings = () => {
  return (
    <div>
      <h5 className="mb-4">General Settings</h5>
      <form>
        <div className="mb-3">
          <label className="form-label">Clinic Name</label>
          <input type="text" className="form-control" defaultValue="Clinica Laguna" />
        </div>
        <div className="mb-3">
          <label className="form-label">Contact Email</label>
          <input type="email" className="form-control" defaultValue="contact@clinica.com" />
        </div>
        <div className="mb-3">
          <label className="form-label">Contact Phone</label>
          <input type="tel" className="form-control" defaultValue="+1234567890" />
        </div>
        <div className="mb-3">
          <label className="form-label">Address</label>
          <textarea className="form-control" rows="3" defaultValue="123 Healthcare Ave, Medical District"></textarea>
        </div>
        <button type="submit" className="btn" style={{ backgroundColor: '#E31937', color: 'white' }}>
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default GeneralSettings;

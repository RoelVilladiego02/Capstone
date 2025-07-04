import React from 'react';

const SecuritySettings = () => {
  return (
    <div>
      <h5 className="mb-4">Security Settings</h5>
      <form>
        <div className="mb-3">
          <label className="form-label">Session Timeout (minutes)</label>
          <input type="number" className="form-control" defaultValue="30" />
        </div>
        <div className="mb-3">
          <label className="form-label">Password Policy</label>
          <div className="form-check mb-2">
            <input className="form-check-input" type="checkbox" defaultChecked />
            <label className="form-check-label">Require minimum 8 characters</label>
          </div>
          <div className="form-check mb-2">
            <input className="form-check-input" type="checkbox" defaultChecked />
            <label className="form-check-label">Require special characters</label>
          </div>
          <div className="form-check mb-2">
            <input className="form-check-input" type="checkbox" defaultChecked />
            <label className="form-check-label">Require numbers</label>
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label">Two-Factor Authentication</label>
          <div className="form-check form-switch">
            <input className="form-check-input" type="checkbox" />
            <label className="form-check-label">Enable for all admin users</label>
          </div>
        </div>
        <button type="submit" className="btn" style={{ backgroundColor: '#E31937', color: 'white' }}>
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default SecuritySettings;

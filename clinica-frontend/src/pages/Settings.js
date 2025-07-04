import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const Settings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentTab = location.pathname.split('/')[2] || 'general';

  const handleTabChange = (tab) => {
    navigate(`/settings/${tab}`);
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Settings</h4>
          <p className="text-muted mb-0">Manage system settings and configuration</p>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${currentTab === 'general' ? 'active' : ''}`}
                onClick={() => handleTabChange('general')}
              >
                General Settings
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${currentTab === 'audit-logs' ? 'active' : ''}`}
                onClick={() => handleTabChange('audit-logs')}
              >
                Audit Logs
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${currentTab === 'security' ? 'active' : ''}`}
                onClick={() => handleTabChange('security')}
              >
                Security Settings
              </button>
            </li>
          </ul>
        </div>

        <div className="card-body">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Settings;

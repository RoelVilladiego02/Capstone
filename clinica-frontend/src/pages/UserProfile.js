import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const UserProfile = () => {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
    emergencyContact: currentUser?.emergencyContact || {
      name: '',
      relationship: '',
      phone: ''
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle profile update
    setIsEditing(false);
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body text-center">
              <div className="mb-4">
                <div 
                  className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center mx-auto"
                  style={{ width: '120px', height: '120px', fontSize: '3rem' }}
                >
                  {formData.fullName.charAt(0)}
                </div>
                <h4 className="mt-3 mb-0">{formData.fullName}</h4>
                <span className="text-muted">{currentUser?.role}</span>
              </div>

              <div className="border-top pt-3">
                <div className="row text-start mt-3">
                  <div className="col-12 mb-2">
                    <strong><i className="bi bi-envelope me-2"></i>Email:</strong>
                    <p className="text-muted mb-0">{formData.email}</p>
                  </div>
                  <div className="col-12 mb-2">
                    <strong><i className="bi bi-telephone me-2"></i>Phone:</strong>
                    <p className="text-muted mb-0">{formData.phone}</p>
                  </div>
                  <div className="col-12">
                    <strong><i className="bi bi-geo-alt me-2"></i>Address:</strong>
                    <p className="text-muted mb-0">{formData.address}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {currentUser?.role === 'Patient' && (
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-3">Quick Actions</h5>
                <div className="d-grid gap-2">
                  <button className="btn btn-outline-primary">
                    <i className="bi bi-calendar-plus me-2"></i>Book Appointment
                  </button>
                  <button className="btn btn-outline-primary">
                    <i className="bi bi-camera-video me-2"></i>Start Teleconsult
                  </button>
                  <button className="btn btn-outline-primary">
                    <i className="bi bi-file-medical me-2"></i>View Medical Records
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="col-md-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="card-title mb-0">Profile Information</h5>
                <button 
                  className="btn btn-sm"
                  onClick={() => setIsEditing(!isEditing)}
                  style={{ 
                    backgroundColor: isEditing ? 'transparent' : '#E31937',
                    color: isEditing ? '#E31937' : 'white',
                    borderColor: '#E31937'
                  }}
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  {/* Form fields */}
                  <div className="col-md-6">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Address</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      disabled={!isEditing}
                    ></textarea>
                  </div>

                  {isEditing && (
                    <div className="col-12 mt-4">
                      <button 
                        type="submit" 
                        className="btn"
                        style={{ backgroundColor: '#E31937', color: 'white' }}
                      >
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

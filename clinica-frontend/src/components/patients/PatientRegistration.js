import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientService } from '../../services/patientService';
import { extractPatientId } from '../../utils/patientUtils';

const PatientRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    user: {
      name: '',
      email: '',
      phone_number: '',
      password: ''
    },
    patient: {
      dob: '',
      gender: '',
      address: '',
      phone: '',
      emergency_contact: ''
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await patientService.createPatient({
        user: {
          name: formData.user.name,
          email: formData.user.email,
          phone_number: formData.user.phone_number,
          password: formData.user.password
        },
        dob: formData.patient.dob,
        gender: formData.patient.gender,
        address: formData.patient.address,
        phone: formData.patient.phone,
        emergency_contact: formData.patient.emergency_contact
      });
      
      const patientId = extractPatientId(response);
      navigate(`/patients/${patientId}`);
    } catch (error) {
      console.error('Error registering patient:', error);
    }
  };

  return (
    <div className="container py-4">
      <h4 className="mb-4">Patient Registration Form</h4>
      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div className="card mb-4">
          <div className="card-header">Basic Information</div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.user.name}
                  onChange={(e) => setFormData({
                    ...formData,
                    user: { ...formData.user, name: e.target.value }
                  })}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.user.email}
                  onChange={(e) => setFormData({
                    ...formData,
                    user: { ...formData.user, email: e.target.value }
                  })}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={formData.user.password}
                  onChange={(e) => setFormData({
                    ...formData,
                    user: { ...formData.user, password: e.target.value }
                  })}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Patient Details */}
        <div className="card mb-4">
          <div className="card-header">Patient Details</div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.patient.dob}
                  onChange={(e) => setFormData({
                    ...formData,
                    patient: { ...formData.patient, dob: e.target.value }
                  })}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Gender</label>
                <select
                  className="form-select"
                  value={formData.patient.gender}
                  onChange={(e) => setFormData({
                    ...formData,
                    patient: { ...formData.patient, gender: e.target.value }
                  })}
                  required
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="col-12">
                <label className="form-label">Address</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.patient.address}
                  onChange={(e) => setFormData({
                    ...formData,
                    patient: { ...formData.patient, address: e.target.value }
                  })}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  value={formData.patient.phone}
                  onChange={(e) => setFormData({
                    ...formData,
                    patient: { ...formData.patient, phone: e.target.value }
                  })}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Emergency Contact</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.patient.emergency_contact}
                  onChange={(e) => setFormData({
                    ...formData,
                    patient: { ...formData.patient, emergency_contact: e.target.value }
                  })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="d-grid gap-2 d-md-flex justify-content-md-end">
          <button type="submit" className="btn btn-primary">Register Patient</button>
        </div>
      </form>
    </div>
  );
};

export default PatientRegistration;

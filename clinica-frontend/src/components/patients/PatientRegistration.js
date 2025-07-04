import React, { useState } from 'react';

const PatientRegistration = () => {
  const [formData, setFormData] = useState({
    personalInfo: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      bloodType: '',
      age: '',
      maritalStatus: '',
    },
    contactInfo: {
      email: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
    },
    medicalInfo: {
      allergies: '',
      currentMedications: '',
      chronicConditions: '',
      previousSurgeries: '',
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <div className="container py-4">
      <h4 className="mb-4">Patient Registration Form</h4>
      <form onSubmit={handleSubmit}>
        <div className="card mb-4">
          <div className="card-header">Personal Information</div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <input
                  type="text"
                  className="form-control"
                  placeholder="First Name"
                  value={formData.personalInfo.firstName}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalInfo: { ...formData.personalInfo, firstName: e.target.value }
                  })}
                />
              </div>
              <div className="col-md-6">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Last Name"
                  value={formData.personalInfo.lastName}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalInfo: { ...formData.personalInfo, lastName: e.target.value }
                  })}
                />
              </div>
              <div className="col-md-4">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Age"
                  value={formData.personalInfo.age}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalInfo: { ...formData.personalInfo, age: e.target.value }
                  })}
                />
              </div>
              <div className="col-md-4">
                <select
                  className="form-select"
                  value={formData.personalInfo.gender}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalInfo: { ...formData.personalInfo, gender: e.target.value }
                  })}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="col-md-4">
                <select
                  className="form-select"
                  value={formData.personalInfo.bloodType}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalInfo: { ...formData.personalInfo, bloodType: e.target.value }
                  })}
                >
                  <option value="">Blood Type</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="card mb-4">
          <div className="card-header">Contact Information</div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email"
                  value={formData.contactInfo.email}
                  onChange={(e) => setFormData({
                    ...formData,
                    contactInfo: { ...formData.contactInfo, email: e.target.value }
                  })}
                />
              </div>
              <div className="col-md-6">
                <input
                  type="tel"
                  className="form-control"
                  placeholder="Phone"
                  value={formData.contactInfo.phone}
                  onChange={(e) => setFormData({
                    ...formData,
                    contactInfo: { ...formData.contactInfo, phone: e.target.value }
                  })}
                />
              </div>
              <div className="col-12">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Address"
                  value={formData.contactInfo.address}
                  onChange={(e) => setFormData({
                    ...formData,
                    contactInfo: { ...formData.contactInfo, address: e.target.value }
                  })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div className="card mb-4">
          <div className="card-header">Medical Information</div>
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label">Allergies</label>
              <textarea
                className="form-control"
                rows="2"
                value={formData.medicalInfo.allergies}
                onChange={(e) => setFormData({
                  ...formData,
                  medicalInfo: { ...formData.medicalInfo, allergies: e.target.value }
                })}
              />
            </div>
            {/* Add more medical info fields */}
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="card mb-4">
          <div className="card-header">Emergency Contact</div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Emergency Contact Name"
                  value={formData.emergencyContact.name}
                  onChange={(e) => setFormData({
                    ...formData,
                    emergencyContact: { ...formData.emergencyContact, name: e.target.value }
                  })}
                />
              </div>
              <div className="col-md-6">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Relationship"
                  value={formData.emergencyContact.relationship}
                  onChange={(e) => setFormData({
                    ...formData,
                    emergencyContact: { ...formData.emergencyContact, relationship: e.target.value }
                  })}
                />
              </div>
              <div className="col-md-6">
                <input
                  type="tel"
                  className="form-control"
                  placeholder="Emergency Contact Phone"
                  value={formData.emergencyContact.phone}
                  onChange={(e) => setFormData({
                    ...formData,
                    emergencyContact: { ...formData.emergencyContact, phone: e.target.value }
                  })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="d-grid gap-2 d-md-flex justify-content-md-end">
          <button type="button" className="btn btn-outline-secondary">Cancel</button>
          <button type="submit" className="btn btn-primary">Register Patient</button>
        </div>
      </form>
    </div>
  );
};

export default PatientRegistration;

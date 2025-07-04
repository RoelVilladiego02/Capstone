import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import clinicaLogo from '../assets/clinica-laguna-logo.png';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    name: '', // changed from fullName to name
    phone_number: '' // changed from phoneNumber to phone_number
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return setError('Passwords do not match');
    }
    try {
      // Always register as Patient
      await register({
        name: formData.name, // changed from fullName
        username: formData.username,
        phone_number: formData.phone_number, // changed from phoneNumber
        email: formData.email,
        password: formData.password,
        role: 'Patient'
      });
      setSuccess('Registration successful! You can now log in.');
      alert('Registration successful! You can now log in.');
      setTimeout(() => {
        navigate('/login');
      }, 500);
    } catch (error) {
      setError(error.message || 'Failed to create an account');
      alert(error.message || 'Failed to create an account');
    }
  };

  return (
    <div className="container-fluid" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="row justify-content-center align-items-center py-5">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow border-0">
            <div className="card-header text-center py-4" style={{ backgroundColor: '#FFFFFF', color: 'white' }}>
              <img src={clinicaLogo} alt="Clinica Laguna Logo" className="img-fluid" style={{ maxHeight: '50px' }} />
            </div>
            <div className="card-body p-4">
              <h4 className="text-center mb-4 fw-bold">Create Your Account</h4>
              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}
              
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter your full name"
                      value={formData.name} // changed from fullName
                      onChange={(e) => setFormData({...formData, name: e.target.value})} // changed from fullName
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="Enter your phone number"
                      value={formData.phone_number} // changed from phoneNumber
                      onChange={(e) => setFormData({...formData, phone_number: e.target.value})} // changed from phoneNumber
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Username</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Choose a username"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Confirm Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-check mb-4">
                  <input className="form-check-input" type="checkbox" id="termsCheck" required />
                  <label className="form-check-label" htmlFor="termsCheck">
                    I agree to the <Link to="/terms" style={{ color: '#E31937' }}>Terms of Service</Link> and <Link to="/privacy" style={{ color: '#E31937' }}>Privacy Policy</Link>
                  </label>
                </div>

                <button 
                  type="submit" 
                  className="btn w-100 mb-3 py-2" 
                  style={{ backgroundColor: '#E31937', color: 'white' }}
                >
                  Create Account
                </button>
                
                <div className="text-center">
                  <Link to="/login" className="text-decoration-none" style={{ color: '#E31937' }}>
                    Already have an account? Login here
                  </Link>
                </div>
              </form>
            </div>
            <div className="card-footer text-center py-3 bg-light">
              <small className="text-muted">© 2025 Clinica Laguna Medical Center • Diagnostics</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
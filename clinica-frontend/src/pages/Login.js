import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import clinicaLogo from '../assets/clinica-laguna-logo.png';

const Login = () => {
  const [formData, setFormData] = useState({
    login: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Only send username and password
      const userData = await login({
        login: formData.login,
        password: formData.password
      });
      // userData is { user: {...}, token: ... }
      const user = userData.user || userData;
      let dashboardPath = '/dashboard'; // Default path
      let role = user.role;
      if (!role && Array.isArray(user.roles) && user.roles.length > 0) {
        role = user.roles[0];
      }
      if (role) {
        const normalizedRole = role.replace(/\s+/g, '');
        const roleToPath = {
          'Admin': '/admin/dashboard',
          'Doctor': '/doctor/dashboard',
          'Receptionist': '/receptionist/dashboard',
          'InventoryManager': '/inventory/dashboard',
          'Inventory Manager': '/inventory/dashboard',
          'Patient': '/dashboard'
        };
        dashboardPath = roleToPath[normalizedRole] || '/dashboard';
      }
      setSuccess('Login successful! Redirecting...');
      alert('Login successful!');
      setTimeout(() => {
        navigate(dashboardPath);
      }, 500);
    } catch (error) {
      setError(error.message || 'Failed to login');
      alert(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="row justify-content-center align-items-center py-5">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow border-0">
            <div className="card-header text-center py-4" style={{ backgroundColor: '#FFFFFF', color: 'white' }}>
              <img src={clinicaLogo} alt="Clinica Laguna Logo" className="img-fluid" style={{ maxHeight: '50px' }} />
            </div>
            <div className="card-body p-4">
              <h4 className="text-center mb-4 fw-bold">Login</h4>
              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Username or Email</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter your username or email"
                    value={formData.login}
                    onChange={(e) => setFormData({...formData, login: e.target.value})}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn w-100 mb-3 py-2" 
                  style={{ backgroundColor: '#E31937', color: 'white' }}
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
                
                <div className="text-center">
                  <Link to="/register" className="text-decoration-none" style={{ color: '#E31937' }}>
                    Don't have an account? Register here
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

export default Login;
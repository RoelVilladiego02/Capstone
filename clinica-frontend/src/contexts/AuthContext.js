import React, { createContext, useContext, useState, useEffect } from 'react';

const BASE_URL = process.env.REACT_APP_API_URL;
console.log('AuthContext BASE_URL:', BASE_URL); // Debug API URL

const AuthContext = createContext();

// Helper to fetch CSRF cookie
const getCsrfToken = async () => {
  await fetch(`${BASE_URL.replace('/api', '')}/sanctum/csrf-cookie`, {
    credentials: 'include'
  });
};

// Helper to get the XSRF token from cookies
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  // On mount, check for token and user in localStorage
  useEffect(() => {
    setLoading(false);
  }, []);

  // Keep user in sync with localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  const login = async (data) => {
    setLoading(true);
    try {
      await getCsrfToken();
      // Get the XSRF token from cookies
      const xsrfToken = getCookie('XSRF-TOKEN');
      // Accept either {login, password} or {username, password}
      const payload = {
        login: data.login || data.username,
        password: data.password
      };
      const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-XSRF-TOKEN': decodeURIComponent(xsrfToken)
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      console.log('Response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.log('Error response:', errorData);
        throw new Error(errorData.message || 'Login failed');
      }
      const dataRes = await response.json();
      console.log('Login successful:', dataRes);
      if (dataRes.token) {
        localStorage.setItem('authToken', dataRes.token);
      }
      if (dataRes.user) {
        setCurrentUser(dataRes.user);
        return dataRes;
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      // 1. Get CSRF cookie
      await getCsrfToken();

      // 2. Get the XSRF token from cookies
      const xsrfToken = getCookie('XSRF-TOKEN');

      // 3. Proceed with registration
      console.log('Registering with:', formData); // Debug registration data
      const response = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': decodeURIComponent(xsrfToken)
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      if (!response.ok) {
        let errorMsg = 'Registration failed';
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
          console.error('Registration error:', errorData); // Debug error
        } catch (e) {
          console.error('Registration error (no JSON):', e);
        }
        throw new Error(errorMsg);
      }
      const data = await response.json();
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        await fetch(`${BASE_URL}/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include'
        });
      } catch {}
    }
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    logout,
    register,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
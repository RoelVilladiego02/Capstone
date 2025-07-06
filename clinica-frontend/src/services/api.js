const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Helper to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper to get CSRF token
const getCsrfToken = async () => {
  await fetch(`${BASE_URL.replace('/api', '')}/sanctum/csrf-cookie`, {
    credentials: 'include'
  });
};

// Helper to get XSRF token from cookies
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

// Base API request function
const apiRequest = async (endpoint, options = {}) => {
  try {
    // Get CSRF token for non-GET requests
    if (options.method && options.method !== 'GET') {
      await getCsrfToken();
      const xsrfToken = getCookie('XSRF-TOKEN');
      options.headers = {
        ...options.headers,
        'X-XSRF-TOKEN': decodeURIComponent(xsrfToken)
      };
    }

    const token = getAuthToken();
    if (token) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      };
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export const api = {
  get: (endpoint) => apiRequest(endpoint),
  post: (endpoint, data) => apiRequest(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint, data) => apiRequest(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' })
}; 
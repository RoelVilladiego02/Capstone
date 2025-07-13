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
    console.log(`Making API request to: ${BASE_URL}${endpoint}`, options);
    
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

    // Don't set Content-Type for FormData (browser will set it automatically with boundary)
    const headers = {
      'Accept': 'application/json',
      ...options.headers
    };

    // Only set Content-Type for JSON data
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    console.log('Request headers:', headers);

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include'
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API error response:', errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API response data:', data);
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export const api = {
  get: (endpoint) => apiRequest(endpoint),
  post: (endpoint, data) => {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return apiRequest(endpoint, { method: 'POST', body });
  },
  put: (endpoint, data) => {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return apiRequest(endpoint, { method: 'PUT', body });
  },
  delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' })
}; 
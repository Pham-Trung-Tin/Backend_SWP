/**
 * API utility functions for making requests to the backend
 */

// Default API configurations
const API_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
};

/**
 * Get auth token from localStorage
 * @returns {string|null} The auth token or null
 */
const getAuthToken = () => {
  // Kiểm tra nhiều vị trí lưu token theo thứ tự ưu tiên
  const sources = [
    { key: 'nosmoke_token', storage: localStorage },
    { key: 'nosmoke_token', storage: sessionStorage },
    { key: 'token', storage: localStorage },
    { key: 'token', storage: sessionStorage },
    { key: 'authToken', storage: localStorage }
  ];
  
  for (const source of sources) {
    const token = source.storage.getItem(source.key);
    if (token) {
      console.log(`🔑 Found auth token in ${source.storage === localStorage ? 'localStorage' : 'sessionStorage'}.${source.key}:`, token.substring(0, 20) + '...');
      return token;
    }
  }
  
  console.warn('⚠️ No auth token found in any storage location');
  console.warn('🔍 Checked locations:', sources.map(s => `${s.storage === localStorage ? 'localStorage' : 'sessionStorage'}.${s.key}`));
  return null;
};

/**
 * Add auth token to request headers if available
 * @param {Object} options - Request options
 * @returns {Object} Updated request options with auth token
 */
const addAuthHeader = (options = {}) => {
  const token = getAuthToken();
  
  const headers = {
    ...API_CONFIG.headers,
    ...options.headers
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('🔐 Added Authorization header');
  } else {
    console.warn('⚠️ No token available for Authorization header');
  }
  
  return {
    ...options,
    headers
  };
};

/**
 * Generic fetch wrapper with error handling
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} Response data
 */
const fetchApi = async (url, options = {}) => {
  try {
    // Log the request for debugging
    console.log(`API Request: ${options.method || 'GET'} ${url}`);
    console.log('Request options:', {
      ...options,
      body: options.body ? '(data omitted for security)' : undefined
    });
    
    // Check if URL is absolute or needs to be prefixed with API_BASE_URL
    let fullUrl = url;
    if (url.startsWith('/api')) {
      // In Vite, import.meta.env should be used instead of process.env
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
      fullUrl = `${apiBaseUrl}${url}`;
      console.log(`Using API base URL: ${apiBaseUrl}`);
    }
    
    const response = await fetch(fullUrl, {
      ...options,
      credentials: API_CONFIG.credentials,
    });
    
    console.log(`API Response status: ${response.status} ${response.statusText}`);
    
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
      console.log('API Response data:', data);
    } else {
      const text = await response.text();
      console.log('API Response text:', text);
      try {
        // Try to parse as JSON anyway
        data = JSON.parse(text);
      } catch (e) {
        // If it's not JSON, create a simple object with the text
        data = { message: text || 'No response content' };
      }
    }
    
    if (!response.ok) {
      const errorMessage = data.message || 
                          data.error || 
                          `Request failed with status: ${response.status}`;
      console.error('API Error:', errorMessage);
      throw new Error(errorMessage);
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export default {
  fetch: fetchApi,
  addAuthHeader,
  getAuthToken
};

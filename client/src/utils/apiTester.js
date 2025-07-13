/**
 * Tiện ích kiểm tra kết nối API
 * 
 * Sử dụng script này để kiểm tra kết nối với backend API
 */

import axios from 'axios';

// Timeout ngắn để kiểm tra nhanh
const testInstance = axios.create({
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Kiểm tra kết nối đến server
 */
export const testServerConnection = async () => {
  try {
    console.log('Testing direct connection to server...');
    const response = await testInstance.get('http://localhost:5000/health');
    
    console.log('✅ Server connection successful:', {
      status: response.status,
      data: response.data
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('❌ Server connection failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    
    return {
      success: false,
      error: error.message,
      details: {
        status: error.response?.status,
        data: error.response?.data
      }
    };
  }
};

/**
 * Kiểm tra kết nối thông qua proxy
 */
export const testProxyConnection = async () => {
  try {
    console.log('Testing connection through proxy...');
    const response = await testInstance.get('/api/health');
    
    console.log('✅ Proxy connection successful:', {
      status: response.status,
      data: response.data
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('❌ Proxy connection failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    
    return {
      success: false,
      error: error.message,
      details: {
        status: error.response?.status,
        data: error.response?.data
      }
    };
  }
};

/**
 * Kiểm tra API endpoints cụ thể
 */
export const testEndpoint = async (endpoint, method = 'get', data = null) => {
  try {
    console.log(`Testing endpoint ${method.toUpperCase()} ${endpoint}...`);
    
    let response;
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    if (method.toLowerCase() === 'get') {
      response = await testInstance.get(endpoint, { headers });
    } else if (method.toLowerCase() === 'post') {
      response = await testInstance.post(endpoint, data, { headers });
    } else if (method.toLowerCase() === 'put') {
      response = await testInstance.put(endpoint, data, { headers });
    } else if (method.toLowerCase() === 'delete') {
      response = await testInstance.delete(endpoint, { headers });
    }
    
    console.log(`✅ Endpoint ${endpoint} successful:`, {
      status: response.status,
      data: response.data
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error(`❌ Endpoint ${endpoint} failed:`, {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    
    return {
      success: false,
      error: error.message,
      details: {
        status: error.response?.status,
        data: error.response?.data
      }
    };
  }
};

/**
 * Kiểm tra tất cả API endpoints quan trọng
 */
export const testAllApiEndpoints = async () => {
  const results = {};
  
  console.log('========== TESTING API CONNECTIVITY ==========');
  results.server = await testServerConnection();
  results.proxy = await testProxyConnection();
  
  console.log('\n========== TESTING PROGRESS ENDPOINTS ==========');
  results.progressUserGet = await testEndpoint('/api/progress/user', 'get');
  results.progressStats = await testEndpoint('/api/progress/stats', 'get');
  
  const today = new Date().toISOString().split('T')[0];
  const testCheckInData = {
    date: today,
    tool_type: 'dashboard',
    progress_data: JSON.stringify({
      targetCigarettes: 10,
      actualCigarettes: 5
    }),
    notes: 'Test note',
    days_clean: 0,
    cigarettes_avoided: 5
  };
  
  results.progressCheckinPost = await testEndpoint('/api/progress/checkin', 'post', testCheckInData);
  
  console.log('\n========== API TEST SUMMARY ==========');
  Object.keys(results).forEach(key => {
    console.log(`${key}: ${results[key].success ? '✅ SUCCESS' : '❌ FAILED'}`);
  });
  
  return results;
};

export default {
  testServerConnection,
  testProxyConnection,
  testEndpoint,
  testAllApiEndpoints
};

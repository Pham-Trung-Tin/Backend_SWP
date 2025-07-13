import axios from 'axios';

// Cấu hình mặc định cho axios
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/', // Sử dụng proxy trong Vite hoặc biến môi trường
  timeout: 15000, // Tăng timeout lên 15s
  headers: {
    'Content-Type': 'application/json',
  },
  // Hiển thị full URL trong lỗi
  validateStatus: function (status) {
    return status >= 200 && status < 300; // default
  }
});

// Log để debug
console.log('Axios instance created with:', {
  baseURL: '/', 
  proxyTarget: 'http://localhost:5000',
  hasToken: Boolean(localStorage.getItem('nosmoke_token') || sessionStorage.getItem('nosmoke_token'))
});

// Thêm interceptor để tự động gửi token authentication trong header
axiosInstance.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage hoặc sessionStorage
    const token = localStorage.getItem('nosmoke_token') || sessionStorage.getItem('nosmoke_token');
    
    // Nếu có token, thêm vào header Authorization
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Thêm interceptor để xử lý response
axiosInstance.interceptors.response.use(
  (response) => {
    // Log success calls
    console.log(`✅ API Success: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data ? '[data available]' : '[no data]'
    });
    return response;
  },
  (error) => {
    // Chi tiết lỗi 
    console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      data: error.response?.data || '[no data]'
    });
    
    // Xử lý lỗi 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      console.log('Unauthorized access. Please log in again.');
      // Có thể redirect đến trang login hoặc thông báo cho người dùng
    }
    
    // Xử lý lỗi 404 (Not Found) - có thể liên quan đến API endpoint
    if (error.response && error.response.status === 404) {
      console.error('API endpoint not found. Check your API URL configuration.');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;

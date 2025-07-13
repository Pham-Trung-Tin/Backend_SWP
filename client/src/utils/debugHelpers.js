/**
 * Các hàm trợ giúp debug API và kết nối server
 */

// Biến kiểm soát việc ghi log
const DEBUG_MODE = true; // Đặt thành false để tắt toàn bộ log

/**
 * Ghi log chi tiết khi gặp lỗi API
 */
export const logApiError = (error, context = '') => {
  if (!DEBUG_MODE) return;
  
  console.group(`🔍 API Error Details ${context ? `(${context})` : ''}`);
  
  console.error('Error summary:', {
    message: error.message,
    status: error.response?.status,
    statusText: error.response?.statusText
  });
  
  if (error.config) {
    // Chỉ log thông tin cần thiết của config
    console.log('Request config:', {
      url: error.config.url,
      method: error.config.method,
      baseURL: error.config.baseURL,
      timeout: error.config.timeout
    });
  }
  
  if (error.response) {
    console.log('Response data:', error.response.data);
  }
  
  console.groupEnd();
};

/**
 * Kiểm tra kết nối đến server API
 */
export const checkApiConnection = async () => {
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  const results = {
    directApi: { success: false, error: null },
    proxyApi: { success: false, error: null },
    authToken: !!token
  };
  
  // Kiểm tra kết nối trực tiếp
  try {
    const directResponse = await fetch('http://localhost:5000/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 3000
    });
    
    results.directApi = {
      success: directResponse.ok,
      status: directResponse.status,
      statusText: directResponse.statusText
    };
    
    if (directResponse.ok) {
      const data = await directResponse.json();
      results.directApi.data = data;
    }
  } catch (error) {
    results.directApi.error = error.message;
  }
  
  // Kiểm tra kết nối qua proxy
  try {
    const proxyResponse = await fetch('/api/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 3000
    });
    
    results.proxyApi = {
      success: proxyResponse.ok,
      status: proxyResponse.status,
      statusText: proxyResponse.statusText
    };
    
    if (proxyResponse.ok) {
      const data = await proxyResponse.json();
      results.proxyApi.data = data;
    }
  } catch (error) {
    results.proxyApi.error = error.message;
  }
  
  // Log kết quả kiểm tra
  console.group('🌐 API Connection Test Results');
  console.log('Direct API connection:', results.directApi.success ? '✅ Connected' : '❌ Failed');
  console.log('Proxy API connection:', results.proxyApi.success ? '✅ Connected' : '❌ Failed');
  console.log('Authentication token:', results.authToken ? '✅ Present' : '❌ Missing');
  console.groupEnd();
  
  return results;
};

/**
 * Ghi log có kiểm soát, chỉ hiển thị trong chế độ DEBUG
 * @param {string} context - Ngữ cảnh của log (ví dụ: "QuitPlan", "Auth", etc.)
 * @param {string} message - Thông điệp log
 * @param {any} data - Dữ liệu đi kèm (tùy chọn)
 * @param {boolean} forcePrint - Buộc hiển thị log ngay cả khi DEBUG_MODE = false (tùy chọn)
 */
export const logDebug = (context, message, data = null, forcePrint = false) => {
  if (!DEBUG_MODE && !forcePrint) return;
  
  const timestamp = new Date().toLocaleTimeString();
  const prefix = `[${timestamp}][${context}]`;
  
  if (data === null) {
    console.log(`${prefix} ${message}`);
  } else {
    // Giới hạn kích thước dữ liệu log để tránh log quá lớn
    const safeData = limitDataSize(data);
    console.log(`${prefix} ${message}`, safeData);
  }
};

/**
 * Giới hạn kích thước dữ liệu để tránh log quá lớn
 * @param {any} data - Dữ liệu cần giới hạn
 * @returns {any} - Dữ liệu đã được giới hạn
 */
function limitDataSize(data) {
  if (!data) return data;
  
  // Nếu là mảng và có nhiều hơn 5 phần tử
  if (Array.isArray(data) && data.length > 5) {
    return [...data.slice(0, 3), `...và ${data.length - 3} phần tử khác...`];
  }
  
  // Nếu là object phức tạp
  if (typeof data === 'object' && data !== null) {
    // Chuyển thành string để kiểm tra kích thước
    const stringData = JSON.stringify(data);
    if (stringData.length > 1000) {
      return `[Object quá lớn - ${stringData.length} ký tự]`;
    }
  }
  
  return data;
}

export default {
  logApiError,
  checkApiConnection,
  logDebug
};

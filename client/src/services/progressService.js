import axios from '../utils/axiosConfig';
import { getCurrentUserId, getAuthToken } from '../utils/userUtils';

// Endpoint cơ sở cho API progress
const API_URL = '/api/progress';

// Debug API URL
console.log('API URL for progress service:', API_URL);

// Service cho các hoạt động liên quan đến tiến trình cai thuốc
const progressService = {
  // Tạo check-in mới cho ngày hôm nay
  createCheckin: async (checkinData) => {
    try {
      // Kiểm tra xem có ngày không, nếu không thì sử dụng ngày hôm nay
      if (!checkinData.date) {
        checkinData.date = new Date().toISOString().split('T')[0];
        console.log('Date not provided, using today:', checkinData.date);
      }
      
      // Calculate statistics based on checkin data
      const targetCigs = parseInt(checkinData.targetCigarettes || 0);
      const actualCigs = parseInt(checkinData.actualCigarettes || 0);
      const initialCigs = parseInt(checkinData.initialCigarettes || checkinData.dailyCigarettes || 50); // Số điếu ban đầu hút 1 ngày
      
      // Calculate cigarettes avoided - FIXED: Dùng số điếu ban đầu - số điếu thực tế hút
      const cigarettesAvoided = Math.max(0, initialCigs - actualCigs);
      
      console.log('🔍 Cigarettes calculation:', {
        initialCigs,
        actualCigs,
        targetCigs,
        cigarettesAvoided
      });
      
      // Calculate money saved (assuming average cost per cigarette)
      const costPerCigarette = checkinData.packPrice ? (checkinData.packPrice / 20) : 1250; // 25,000 VND per pack of 20
      const moneySaved = cigarettesAvoided * costPerCigarette;
      
      // Calculate health score (simple formula based on cigarettes avoided)
      // 0-100 scale where 0 = smoked all cigarettes, 100 = avoided all cigarettes
      const healthScore = initialCigs > 0 ? Math.round((cigarettesAvoided / initialCigs) * 100) : 0;
      
      const newFormatData = {
        date: checkinData.date,
        targetCigarettes: targetCigs,
        actualCigarettes: actualCigs,
        cigarettesAvoided: cigarettesAvoided,
        moneySaved: moneySaved,
        healthScore: healthScore,
        notes: checkinData.notes || ''
      };

      console.log('Sending checkin data to API:', `${API_URL}/checkin`, newFormatData);
      console.log('Full request URL:', window.location.origin + API_URL + '/checkin');
      const response = await axios.post(`${API_URL}/checkin`, newFormatData);
      console.log('Checkin API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating checkin:', error);
      console.error('Error details:', {
        message: error.message,
        responseData: error.response?.data,
        status: error.response?.status,
        url: API_URL + '/checkin',
        config: error.config,
      });
      
      // Thử lại với axios trực tiếp nếu lỗi liên quan đến proxy
      if (error.message && (error.message.includes('404') || error.response?.status === 404)) {
        try {
          console.warn('Trying direct API call to bypass proxy issues...');
          // Thử gọi trực tiếp đến server
          const directUrl = 'http://localhost:5000/api/progress/checkin';
          console.log('Trying direct URL:', directUrl);
          const directResponse = await axios.create({
            baseURL: 'http://localhost:5000',
            timeout: 10000,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('nosmoke_token') || sessionStorage.getItem('nosmoke_token') || localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')}`
            },
          }).post('/api/progress/checkin', newFormatData);
          console.log('Direct API call successful:', directResponse.data);
          return directResponse.data;
        } catch (directError) {
          console.error('Direct API call also failed:', directError.message);
          throw directError;
        }
      }
      
      throw error;
    }
  },

  // Cập nhật check-in cho một ngày cụ thể
  updateCheckin: async (date, checkinData) => {
    try {
      console.log(`Updating checkin for date ${date}:`, checkinData);
      
      // Đầu tiên lấy dữ liệu hiện tại để giữ lại các thông số thống kê khác
      const currentData = await progressService.getCheckinByDate(date);
      
      // Calculate statistics based on checkin data
      const targetCigs = parseInt(checkinData.targetCigarettes || 0);
      const actualCigs = parseInt(checkinData.actualCigarettes || 0);
      const initialCigs = parseInt(checkinData.initialCigarettes || checkinData.dailyCigarettes || 50); // Số điếu ban đầu hút 1 ngày
      
      // Calculate cigarettes avoided - FIXED: Dùng số điếu ban đầu - số điếu thực tế hút
      const cigarettesAvoided = Math.max(0, initialCigs - actualCigs);
      
      console.log('🔍 Update cigarettes calculation:', {
        initialCigs,
        actualCigs,
        targetCigs,
        cigarettesAvoided
      });
      
      // Calculate money saved (assuming average cost per cigarette)
      const costPerCigarette = checkinData.packPrice ? (checkinData.packPrice / 20) : 1250; // 25,000 VND per pack of 20
      const moneySaved = cigarettesAvoided * costPerCigarette;
      
      // Calculate health score (simple formula based on cigarettes avoided)
      // 0-100 scale where 0 = smoked all cigarettes, 100 = avoided all cigarettes
      const healthScore = initialCigs > 0 ? Math.round((cigarettesAvoided / initialCigs) * 100) : 0;
      
      const updatedData = {
        targetCigarettes: targetCigs,
        actualCigarettes: actualCigs,
        cigarettesAvoided: cigarettesAvoided,
        moneySaved: moneySaved,
        healthScore: healthScore,
        notes: checkinData.notes || ''
      };

      console.log('Sending update data to API:', `${API_URL}/checkin/${date}`, updatedData);
      const response = await axios.put(`${API_URL}/checkin/${date}`, updatedData);
      console.log('Update API response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating checkin for ${date}:`, error);
      console.error('Update error details:', {
        message: error.message,
        responseData: error.response?.data,
        status: error.response?.status,
        url: `${API_URL}/checkin/${date}`,
        config: error.config,
      });
      
      // Thử lại với axios trực tiếp nếu lỗi liên quan đến proxy
      if (error.message && (error.message.includes('404') || error.response?.status === 404)) {
        try {
          console.warn('Trying direct API call to bypass proxy issues...');
          // Thử gọi trực tiếp đến server
          const directUrl = `http://localhost:5000/api/progress/checkin/${date}`;
          console.log('Trying direct URL:', directUrl);
          const directResponse = await axios.create({
            baseURL: 'http://localhost:5000',
            timeout: 10000,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('nosmoke_token') || sessionStorage.getItem('nosmoke_token') || localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')}`
            },
          }).put(`/api/progress/checkin/${date}`, updatedData);
          console.log('Direct API call successful:', directResponse.data);
          return directResponse.data;
        } catch (directError) {
          console.error('Direct API call also failed:', directError.message);
          throw directError;
        }
      }
      
      throw error;
    }
  },

  // Lấy check-in cho một ngày cụ thể
  getCheckinByDate: async (date) => {
    try {
      console.log(`Getting checkin for date: ${date}`);
      console.log('Request URL:', `${API_URL}/user/${date}`);
      const response = await axios.get(`${API_URL}/user/${date}`);
      console.log('GetCheckinByDate API response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error getting checkin for ${date}:`, error);
      console.error('GetCheckinByDate error details:', {
        message: error.message,
        responseData: error.response?.data,
        status: error.response?.status,
        url: `${API_URL}/user/${date}`,
        config: error.config,
      });
      
      // Thử lại với axios trực tiếp nếu lỗi liên quan đến proxy
      if (error.message && (error.message.includes('404') || error.response?.status === 404)) {
        try {
          console.warn('Trying direct API call to bypass proxy issues...');
          // Thử gọi trực tiếp đến server
          const directUrl = `http://localhost:5000/api/progress/user/${date}`;
          console.log('Trying direct URL:', directUrl);
          const directResponse = await axios.create({
            baseURL: 'http://localhost:5000',
            timeout: 10000,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('nosmoke_token') || sessionStorage.getItem('nosmoke_token') || localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')}`
            },
          }).get(`/api/progress/user/${date}`);
          console.log('Direct API call successful:', directResponse.data);
          return directResponse.data;
        } catch (directError) {
          console.error('Direct API call also failed:', directError.message);
          throw directError;
        }
      }
      
      throw error;
    }
  },

  // Lấy tất cả check-in của người dùng hiện tại
  getUserProgress: async (params = {}) => {
    try {
      // Lấy userId từ getCurrentUserId
      const userId = getCurrentUserId();
      if (!userId) {
        console.warn('⚠️ User not logged in, cannot fetch progress');
        throw new Error('User not logged in');
      }
      
      console.log('🔍 Getting user progress for userId:', userId);
      
      // Lấy kế hoạch hiện tại để bổ sung mục tiêu
      let currentPlan = null;
      try {
        const quitPlanService = await import('./quitPlanService.js');
        const planResponse = await quitPlanService.default.getUserActivePlan();
        if (planResponse && planResponse.success && planResponse.plan) {
          currentPlan = planResponse.plan;
          console.log("Đã lấy được kế hoạch hiện tại:", currentPlan);
        }
      } catch (planError) {
        console.warn("Không thể lấy được kế hoạch hiện tại:", planError);
      }
      
      // Tạo bảng tra cứu các mục tiêu theo ngày nếu có kế hoạch
      const planTargets = {};
      if (currentPlan && currentPlan.weeks && Array.isArray(currentPlan.weeks)) {
        const startDate = new Date(currentPlan.start_date || currentPlan.startDate);
        
        // Tạo mục tiêu cho từng ngày dựa trên các tuần trong kế hoạch
        currentPlan.weeks.forEach((week, weekIndex) => {
          for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + (weekIndex * 7) + dayOfWeek);
            const dateStr = currentDate.toISOString().split('T')[0];
            
            // Lưu mục tiêu cho ngày này - ưu tiên amount hoặc targetCigarettes nếu có
            planTargets[dateStr] = week.amount || week.targetCigarettes || week.target || 0;
          }
        });
        
        console.log("Đã tạo bảng tra cứu mục tiêu từ kế hoạch:", planTargets);
      }
      
      // Sử dụng API endpoint theo userId thay vì token-based
      const response = await progressService.getProgressByUserId(userId, params);
      
      // Chuyển đổi dữ liệu từ cấu trúc mới sang định dạng mà frontend cần
      if (response && response.data) {
        response.data = response.data.map(item => {
          // Parse progress_data từ JSON
          const progressData = item.progress_data ? JSON.parse(item.progress_data) : {};
          const dateStr = item.date;
          
          // Lấy mục tiêu từ progress_data hoặc từ kế hoạch nếu không có
          const targetCigs = progressData.targetCigarettes || planTargets[dateStr] || 0;
          
          return {
            id: item.id,
            date: dateStr,
            // Lấy dữ liệu từ progress_data hoặc kế hoạch
            targetCigarettes: targetCigs,
            actualCigarettes: progressData.actualCigarettes || 0,
            // Lấy thông số thống kê từ bảng
            days_clean: item.days_clean || 0,
            money_saved: item.money_saved || 0,
            cigarettes_avoided: item.cigarettes_avoided || 0,
            health_score: item.health_score || 0,
            progress_percentage: item.progress_percentage || 0,
            notes: item.notes || '',
            created_at: item.created_at,
            updated_at: item.updated_at
          };
        });
        
        // Thêm các ngày chỉ có mục tiêu nhưng không có check-in nếu có kế hoạch
        if (Object.keys(planTargets).length > 0) {
          const existingDates = new Set(response.data.map(item => item.date));
          
          // Thêm mục tiêu cho các ngày không có check-in
          Object.entries(planTargets).forEach(([date, target]) => {
            if (!existingDates.has(date)) {
              // Chỉ thêm các ngày trong phạm vi thời gian hợp lý
              const targetDate = new Date(date);
              const today = new Date();
              
              // Chỉ thêm các ngày từ ngày bắt đầu kế hoạch đến hôm nay
              if (targetDate <= today) {
                response.data.push({
                  id: null,
                  date: date,
                  targetCigarettes: target,
                  actualCigarettes: null, // Null vì không có dữ liệu thực tế
                  days_clean: 0,
                  money_saved: 0,
                  cigarettes_avoided: 0,
                  health_score: 0,
                  progress_percentage: 0,
                  notes: '',
                  created_at: null,
                  updated_at: null,
                  isTargetOnly: true // Đánh dấu là chỉ có dữ liệu mục tiêu
                });
              }
            }
          });
          
          // Sắp xếp lại dữ liệu theo ngày
          response.data.sort((a, b) => new Date(a.date) - new Date(b.date));
        }
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching user progress:', error);
      throw error;
    }
  },

  // Lấy check-in cho một ngày cụ thể
  getCheckinByDate: async (date) => {
    try {
      // Lấy userId từ getCurrentUserId
      const userId = getCurrentUserId();
      if (!userId) {
        console.warn('⚠️ User not logged in, cannot fetch checkin');
        return { data: null };
      }
      
      console.log(`🔍 Getting checkin for userId ${userId} on date: ${date}`);
      
      // Sử dụng API endpoint theo userId
      const response = await fetch(`/api/progress/${userId}/${date}`);
      
      if (response.status === 404) {
        return { data: null };
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${data.message || 'Unknown error'}`);
      }
      
      // Chuyển đổi dữ liệu từ cấu trúc mới sang định dạng mà frontend cần
      if (data && data.data) {
        const item = data.data;
        // Parse progress_data từ JSON
        const progressData = item.progress_data ? JSON.parse(item.progress_data) : {};
        
        data.data = {
          id: item.id,
          date: item.date,
          // Lấy dữ liệu từ progress_data
          targetCigarettes: progressData.targetCigarettes || 0,
          actualCigarettes: progressData.actualCigarettes || 0,
          // Lấy thông số thống kê từ bảng
          days_clean: item.days_clean || 0,
          money_saved: item.money_saved || 0,
          cigarettes_avoided: item.cigarettes_avoided || 0,
          health_score: item.health_score || 0,
          progress_percentage: item.progress_percentage || 0,
          notes: item.notes || '',
          created_at: item.created_at,
          updated_at: item.updated_at
        };
      }
      
      return data;
    } catch (error) {
      console.error(`Error fetching checkin for ${date}:`, error);
      throw error;
    }
  },

  // Xóa check-in cho một ngày cụ thể
  deleteCheckin: async (date) => {
    try {
      const response = await axios.delete(`${API_URL}/checkin/${date}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting checkin for ${date}:`, error);
      throw error;
    }
  },

  // Lấy số liệu thống kê tiến trình
  getProgressStats: async (days = 30) => {
    try {
      // Lấy userId từ getCurrentUserId
      const userId = getCurrentUserId();
      const token = getAuthToken();
      
      if (!userId || !token) {
        console.warn('⚠️ User not logged in, cannot fetch progress stats');
        throw new Error('User not logged in');
      }
      
      console.log('🔍 Getting progress stats for userId:', userId);
      
      // Sử dụng token-based API (vì chưa có userId-based endpoint)
      const response = await axios.get(`${API_URL}/stats`, {
        params: { days },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = response.data;
      if (data && data.data) {
        // Tính toán thêm số ngày không hút thuốc (nếu chưa có)
        if (data.data.total_checkins > 0 && !data.data.no_smoking_days) {
          data.data.no_smoking_days = data.data.total_checkins > 0 ? 
            Math.round((data.data.goals_met / data.data.total_checkins) * data.data.period_days) : 0;
        }
        
        // Thêm thông tin về lợi ích sức khỏe
        if (!data.data.health_benefits) {
          // Tính các milestone sức khỏe được xử lý bởi ProgressDashboard component
          data.data.health_benefits = [];
        }
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching progress stats:', error);
      throw error;
    }
  },

  // Lấy dữ liệu cho biểu đồ
  getChartData: async (params = {}) => {
    try {
      // Lấy userId từ getCurrentUserId
      const userId = getCurrentUserId();
      const token = getAuthToken();
      
      if (!userId || !token) {
        console.warn('⚠️ User not logged in, cannot fetch chart data');
        throw new Error('User not logged in');
      }
      
      console.log('🔍 Getting chart data for userId:', userId);
      
      // Đảm bảo có type và days trong params
      const enhancedParams = {
        type: 'comprehensive', // Mặc định là lấy tất cả dữ liệu
        days: 30,             // Mặc định 30 ngày
        ...params
      };
      
      // Lấy kế hoạch hiện tại từ quitPlanService
      let currentPlan = null;
      try {
        const quitPlanService = await import('./quitPlanService.js');
        const planResponse = await quitPlanService.default.getUserActivePlan();
        if (planResponse && planResponse.success && planResponse.plan) {
          currentPlan = planResponse.plan;
          console.log("Đã lấy được kế hoạch hiện tại cho biểu đồ:", currentPlan);
        }
      } catch (planError) {
        console.warn("Không thể lấy được kế hoạch hiện tại:", planError);
      }
      
      // Sử dụng token-based API
      const response = await axios.get(`${API_URL}/chart-data`, {
        params: enhancedParams,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = response.data;
      
      // Xử lý và định dạng dữ liệu cho biểu đồ
      if (data && data.data) {
        // Đảm bảo dữ liệu được sắp xếp theo ngày
        data.data = data.data
          .map(item => {
            return {
              date: item.date,
              actual: item.actual || 0,
              target: item.target || 0,
              healthScore: item.healthScore || 0,
              cigarettesAvoided: item.cigarettesAvoided || 0,
              moneySaved: item.moneySaved || 0,
              streakDays: item.streakDays || 0
            };
          })
          .sort((a, b) => new Date(a.date) - new Date(b.date));
          
        // Thêm dữ liệu từ kế hoạch nếu có kế hoạch hiện tại
        if (currentPlan && currentPlan.weeks && Array.isArray(currentPlan.weeks)) {
          // Tạo bảng tra cứu các mục tiêu theo ngày
          const planTargets = {};
          const startDate = new Date(currentPlan.start_date || currentPlan.startDate);
          
          // Tạo mục tiêu cho từng ngày dựa trên các tuần trong kế hoạch
          currentPlan.weeks.forEach((week, weekIndex) => {
            for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
              const currentDate = new Date(startDate);
              currentDate.setDate(startDate.getDate() + (weekIndex * 7) + dayOfWeek);
              const dateStr = currentDate.toISOString().split('T')[0];
              
              // Lưu mục tiêu cho ngày này - ưu tiên amount hoặc targetCigarettes nếu có
              planTargets[dateStr] = week.amount || week.targetCigarettes || week.target || 0;
            }
          });
          
          console.log("Đã tạo bảng tra cứu mục tiêu từ kế hoạch:", planTargets);
          
          // Điền mục tiêu vào dữ liệu hiện có hoặc thêm mới nếu chưa có
          const existingDates = new Set(response.data.data.map(item => item.date));
          const allDates = new Set([...existingDates, ...Object.keys(planTargets)]);
          
          // Tạo mảng dữ liệu mới với đầy đủ mục tiêu
          const newData = [];
          allDates.forEach(date => {
            const existingItem = data.data.find(item => item.date === date);
            
            if (existingItem) {
              // Cập nhật mục tiêu nếu chưa có
              if (!existingItem.target && planTargets[date] !== undefined) {
                existingItem.target = planTargets[date];
              }
              newData.push(existingItem);
            } else if (planTargets[date] !== undefined) {
              // Thêm mục tiêu mới nếu không có dữ liệu hiện có
              newData.push({
                date: date,
                actual: null,
                target: planTargets[date],
                healthScore: 0,
                cigarettesAvoided: 0,
                moneySaved: 0,
                streakDays: 0
              });
            }
          });
          
          // Sắp xếp lại dữ liệu theo ngày
          data.data = newData.sort((a, b) => new Date(a.date) - new Date(b.date));
          console.log(`Đã cập nhật ${newData.length} mục dữ liệu biểu đồ với mục tiêu từ kế hoạch`);
        }
        
        // Tính toán thêm dữ liệu xu hướng nếu có nhiều hơn 2 điểm dữ liệu
        if (data.data.length > 2) {
          // Tính xu hướng hút thuốc (tăng/giảm)
          const firstActual = data.data[0].actual;
          const lastActual = data.data[data.data.length - 1].actual;
          const trend = firstActual > lastActual ? 'decrease' : 
                      (firstActual < lastActual ? 'increase' : 'stable');
          
          // Tính phần trăm thay đổi
          const changePercent = firstActual > 0 ? 
            Math.round(((lastActual - firstActual) / firstActual) * 100) : 0;
            
          data.trend = {
            direction: trend,
            percentage: Math.abs(changePercent),
            startValue: firstActual,
            endValue: lastActual
          };
        }
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching chart data:', error);
      throw error;
    }
  },

  // Tạo check-in theo userId (không cần auth)
  createCheckinByUserId: async (userId, checkinData) => {
    try {
      console.log(`Creating checkin for userId ${userId}:`, checkinData);
      
      if (!checkinData.date) {
        checkinData.date = new Date().toISOString().split('T')[0];
      }
      
      // Calculate statistics
      const targetCigs = parseInt(checkinData.targetCigarettes || 0);
      const actualCigs = parseInt(checkinData.actualCigarettes || 0);
      const initialCigs = parseInt(checkinData.initialCigarettes || checkinData.dailyCigarettes || 50); // Số điếu ban đầu hút 1 ngày
      
      // Calculate cigarettes avoided - FIXED: Dùng số điếu ban đầu - số điếu thực tế hút
      const cigarettesAvoided = Math.max(0, initialCigs - actualCigs);
      
      console.log('🔍 CreateCheckinByUserId cigarettes calculation:', {
        initialCigs,
        actualCigs,
        targetCigs,
        cigarettesAvoided
      });
      
      const costPerCigarette = checkinData.packPrice ? (checkinData.packPrice / 20) : 1250;
      const moneySaved = cigarettesAvoided * costPerCigarette;
      const healthScore = initialCigs > 0 ? Math.round((cigarettesAvoided / initialCigs) * 100) : 0;
      
      const dataToSend = {
        date: checkinData.date,
        targetCigarettes: targetCigs,
        actualCigarettes: actualCigs,
        cigarettesAvoided: cigarettesAvoided,
        moneySaved: moneySaved,
        healthScore: healthScore,
        notes: checkinData.notes || '',
        toolType: 'quit_smoking_plan',
        daysClean: checkinData.daysClean,
        vapesAvoided: checkinData.vapesAvoided,
        progressPercentage: healthScore,
        progressData: checkinData.progressData || {}
      };

      console.log(`Sending to API: POST /api/progress/${userId}`, dataToSend);
      
      // Sử dụng fetch thay vì axios để tránh lỗi proxy
      const response = await fetch(`/api/progress/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${result.message || 'Unknown error'}`);
      }

      console.log('✅ Checkin created successfully:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Error in createCheckinByUserId:', error);
      throw error;
    }
  },

  // Lấy progress theo userId (không cần auth)
  getProgressByUserId: async (userId, params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `/api/progress/${userId}${queryString ? '?' + queryString : ''}`;
      
      console.log(`Getting progress for userId ${userId}:`, url);
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${result.message || 'Unknown error'}`);
      }

      console.log('✅ Progress retrieved successfully:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Error in getProgressByUserId:', error);
      throw error;
    }
  },

  // Clear all progress data for current user
  clearUserProgress: async () => {
    try {
      // Lấy userId từ getCurrentUserId
      const userId = getCurrentUserId();
      const token = getAuthToken();
      
      if (!userId || !token) {
        console.warn('⚠️ User not logged in, cannot clear progress');
        throw new Error('User not logged in');
      }
      
      console.log('🔍 Clearing all progress for userId:', userId);
      
      // Gọi API để xóa tất cả progress của user
      const response = await axios.delete(`${API_URL}/user/${userId}/clear`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ All progress cleared successfully:', response.data);
      
      // Clear localStorage progress data
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('checkin_')) {
          localStorage.removeItem(key);
        }
      });
      
      return response.data;
      
    } catch (error) {
      console.error('❌ Error clearing user progress:', error);
      
      // Fallback: Clear localStorage anyway
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('checkin_')) {
          localStorage.removeItem(key);
        }
      });
      
      throw error;
    }
  },

  // Force clear all progress data (both database and localStorage)
  forceCleanAllProgress: async () => {
    try {
      console.log('🔍 Force cleaning all progress data...');
      
      // 1. Try to clear database via API
      try {
        await progressService.clearUserProgress();
        console.log('✅ Database progress cleared');
      } catch (apiError) {
        console.warn('⚠️ Could not clear database progress:', apiError);
      }
      
      // 2. Clear localStorage
      try {
        const keys = Object.keys(localStorage);
        let cleared = 0;
        keys.forEach(key => {
          if (key.startsWith('checkin_')) {
            localStorage.removeItem(key);
            cleared++;
          }
        });
        console.log(`✅ Cleared ${cleared} localStorage progress entries`);
      } catch (localStorageError) {
        console.warn('⚠️ Could not clear localStorage:', localStorageError);
      }
      
      // 3. Clear sessionStorage
      try {
        const sessionKeys = Object.keys(sessionStorage);
        let sessionCleared = 0;
        sessionKeys.forEach(key => {
          if (key.startsWith('checkin_')) {
            sessionStorage.removeItem(key);
            sessionCleared++;
          }
        });
        console.log(`✅ Cleared ${sessionCleared} sessionStorage progress entries`);
      } catch (sessionStorageError) {
        console.warn('⚠️ Could not clear sessionStorage:', sessionStorageError);
      }
      
      console.log('✅ Force clean completed');
      return true;
      
    } catch (error) {
      console.error('❌ Error in force clean:', error);
      return false;
    }
  },
};

export default progressService;

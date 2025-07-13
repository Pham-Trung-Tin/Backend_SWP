import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import QuitProgressChart from '../components/QuitProgressChart';
import DailyCheckin from '../components/DailyCheckin';
import ProgressDashboard from '../components/ProgressDashboard';
import ResetCheckinData from '../components/ResetCheckinData';
import { FaCalendarCheck, FaLeaf, FaCoins, FaHeart } from 'react-icons/fa';
import progressService from '../services/progressService';
import './Progress.css';
import '../styles/DailyCheckin.css';
import '../styles/ProgressDashboard.css';

export default function Progress() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTimeFilter, setActiveTimeFilter] = useState('30 ngày');
  const [showCompletionDashboard, setShowCompletionDashboard] = useState(false);
  const [completionData, setCompletionData] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [userProgress, setUserProgress] = useState([]);
  const [actualProgress, setActualProgress] = useState([]);
  const [moodData, setMoodData] = useState([]);
  const [hasPlan, setHasPlan] = useState(false); 
  const [shouldRedirect, setShouldRedirect] = useState(false);
  // Thêm state để lưu trữ các thống kê dashboard
  const [dashboardStats, setDashboardStats] = useState({
    noSmokingDays: 0,
    savedCigarettes: 0,
    savedMoney: 0,
    healthProgress: 0
  });
  
  // Removed health benefits function - now handled by ProgressDashboard component

  // Load user plan and progress from localStorage and API
  useEffect(() => {
    loadUserPlanAndProgress();
    
    // Force refresh of data after component mounts to ensure we have latest data
    const refreshTimer = setTimeout(() => {
      console.log("Auto-refreshing data after 1 second to ensure we have latest data");
      recalculateStatistics();
      
      // Thêm bảo vệ: nếu không có dữ liệu actualProgress, load lại từ API
      if (!actualProgress || actualProgress.length === 0) {
        console.log("Không có dữ liệu actualProgress, load lại từ API...");
        loadUserPlanAndProgress();
      }
    }, 1000);
    
    // Thử load dashboard stats từ localStorage trước
    const savedStats = localStorage.getItem('dashboardStats');
    let shouldRecalculate = true;
    
    if (savedStats) {
      try {
        const parsedStats = JSON.parse(savedStats);
        console.log("Đã tìm thấy dashboard stats từ localStorage:", parsedStats);
        
        // Kiểm tra xem dữ liệu có hợp lệ không
        if (parsedStats && parsedStats.savedCigarettes !== undefined) {
          console.log("Sử dụng dữ liệu đã lưu: " + parsedStats.savedCigarettes + " điếu đã tránh");
          setDashboardStats(parsedStats);
          shouldRecalculate = false;
        }
      } catch (error) {
        console.error("Lỗi khi parse dashboard stats:", error);
        shouldRecalculate = true;
      }
    }
    
    // Lấy dữ liệu từ API
    const fetchAPIData = async () => {
      try {
        // Lấy thống kê từ API
        const statsResponse = await progressService.getProgressStats();
        if (statsResponse.data) {
          console.log("Đã nhận thống kê từ API:", statsResponse.data);
          
          // Cập nhật bổ sung thông tin từ API
          setDashboardStats(prevStats => ({
            ...prevStats,
            maxStreak: statsResponse.data.max_streak || 0,
            currentStreak: statsResponse.data.current_streak || 0,
            totalCheckins: statsResponse.data.total_checkins || 0,
            goalsMetRate: statsResponse.data.success_rate || 0,
            healthProgress: statsResponse.data.avg_health_score || 0
          }));
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu từ API:", error);
      }
    };
    
    fetchAPIData();
    
    // Nếu không có dữ liệu từ localStorage hoặc dữ liệu không hợp lệ, tính toán lại
    if (shouldRecalculate) {
      console.log("Không tìm thấy dữ liệu hoặc dữ liệu không hợp lệ, tính toán lại thống kê...");
      const timer = setTimeout(() => {
        recalculateStatistics();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  const loadUserPlanAndProgress = async () => {
    console.log("LOADING USER PLAN...");
    
    // KHÔNG xóa thống kê cũ khi load lại trang để duy trì dữ liệu giữa các phiên
    console.log("Giữ lại thống kê cũ để duy trì dữ liệu giữa các lần chuyển trang");
    
    // Thử tải kế hoạch từ DATABASE trước
    let planFromDatabase = null;
    const auth_token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    
    if (auth_token) {
      try {
        console.log("🔄 Đang tải kế hoạch từ DATABASE...");
        const quitPlanService = await import('../services/quitPlanService');
        const response = await quitPlanService.getUserActivePlan();
        
        if (response && response.success && response.plan) {
          planFromDatabase = response.plan;
          console.log("✅ Đã tải kế hoạch từ DATABASE:", planFromDatabase);
          
          // Cập nhật localStorage với kế hoạch từ database
          localStorage.setItem('activePlan', JSON.stringify(planFromDatabase));
          
          // Set state với kế hoạch từ database
          setUserPlan(planFromDatabase);
          setHasPlan(true);
          
          // Load progress và return sớm
          await loadActualProgressFromCheckins(planFromDatabase);
          return;
        } else {
          console.log("ℹ️ Không tìm thấy kế hoạch active trong database");
        }
      } catch (error) {
        console.error("❌ Lỗi khi tải kế hoạch từ database:", error);
      }
    } else {
      console.log("⚠️ Không có auth token, không thể tải từ database");
    }

    // Fallback: Thử tải từ localStorage nếu không có trong database
    const savedActivePlan = localStorage.getItem('activePlan');
    
    // Kiểm tra xem có kế hoạch active thực sự không
    let hasActivePlan = false;
    let localPlan = null;
    
    if (savedActivePlan) {
      try {
        const parsedPlan = JSON.parse(savedActivePlan);
        if (parsedPlan && Array.isArray(parsedPlan.weeks) && parsedPlan.weeks.length > 0) {
          console.log("📱 Đã tìm thấy kế hoạch trong localStorage:", parsedPlan.name);
          hasActivePlan = true;
          localPlan = parsedPlan;
        }
      } catch (e) {
        console.error("❌ Lỗi khi parse kế hoạch từ localStorage:", e);
      }
    }
    
    // Load completion data từ JourneyStepper
    const savedCompletion = localStorage.getItem('quitPlanCompletion');
    if (savedCompletion) {
      try {
        const completion = JSON.parse(savedCompletion);
        if (completion && completion.userPlan) {
          setCompletionData(completion);
          setUserPlan(completion.userPlan);
          setShowCompletionDashboard(true);
          setHasPlan(true);
          console.log("✅ Đã tải kế hoạch từ completion data");
        } else {
          console.warn('Found saved completion data but it was incomplete');
          setUserPlan(localPlan);
          setHasPlan(hasActivePlan);
        }
      } catch (error) {
        console.error('Error parsing completion data:', error);
        setUserPlan(localPlan);
        setHasPlan(hasActivePlan);
      }
    } else {
      // Nếu chưa có completion data, sử dụng plan từ localStorage hoặc null
      setUserPlan(localPlan);
      setHasPlan(hasActivePlan);
      console.log("📱 Sử dụng kế hoạch từ localStorage hoặc null:", localPlan);
    }

    // Load actual progress từ daily check-ins
    await loadActualProgressFromCheckins(localPlan || getDefaultPlan());
  };
  
  const getActivePlan = () => {
    // Kiểm tra nếu có kế hoạch đang thực hiện trong localStorage
    try {
      const savedPlan = localStorage.getItem('activePlan');
      if (savedPlan) {
        const parsedPlan = JSON.parse(savedPlan);
        if (parsedPlan && Array.isArray(parsedPlan.weeks) && parsedPlan.weeks.length > 0) {
          console.log("Đã tìm thấy kế hoạch active hợp lệ");
          return parsedPlan;
        } else {
          console.warn("Tìm thấy kế hoạch active nhưng không hợp lệ");
        }
      } else {
        console.log("Không tìm thấy kế hoạch active trong localStorage");
      }
    } catch (error) {
      console.error('Error loading saved plan:', error);
    }
    
    // Trả về null thay vì kế hoạch mặc định để phân biệt rõ ràng
    console.log("Không có kế hoạch thực tế - trả về null");
    return null;
  };
  
  // Hàm tạo kế hoạch mặc định chỉ khi cần
  const getDefaultPlan = () => {
    return {
      name: "Kế hoạch mặc định",
      startDate: new Date().toISOString().split('T')[0],
      weeks: [
        { week: 1, amount: 22, phase: "Thích nghi" },
        { week: 2, amount: 17, phase: "Thích nghi" },
        { week: 3, amount: 12, phase: "Tăng tốc" },
        { week: 4, amount: 8, phase: "Tăng tốc" },        
        { week: 5, amount: 5, phase: "Hoàn thiện" },
        { week: 6, amount: 2, phase: "Hoàn thiện" },
        { week: 7, amount: 0, phase: "Mục tiêu đạt được" }
      ],
      initialCigarettes: 22
    };
  };
  const loadActualProgressFromCheckins = async (providedActivePlan = null) => {
    const actualData = [];
    const today = new Date();
    
    // Log start of loading
    console.log("🔄 Đang tải dữ liệu thực tế từ DATABASE...");
    
    // Lấy ngày bắt đầu kế hoạch từ activePlan
    let planStartDate = null;
    let activePlan = providedActivePlan;
    try {
      const activePlanData = localStorage.getItem('activePlan');
      if (activePlanData) {
        activePlan = JSON.parse(activePlanData);
        planStartDate = activePlan.startDate ? new Date(activePlan.startDate) : null;
      }
    } catch (error) {
      console.error('Lỗi khi đọc ngày bắt đầu từ activePlan:', error);
    }
    
    // Nếu không có ngày bắt đầu, chỉ lấy dữ liệu từ hôm nay
    if (!planStartDate) {
      planStartDate = new Date();
      console.log("Không tìm thấy ngày bắt đầu kế hoạch, chỉ tải dữ liệu hôm nay");
    }
    
    console.log(`Kế hoạch bắt đầu từ: ${planStartDate.toISOString().split('T')[0]}`);
    
    // Tạo bảng tra cứu mục tiêu hàng ngày từ kế hoạch
    const dailyTargets = {};
    if (activePlan && Array.isArray(activePlan.weeks) && activePlan.weeks.length > 0) {
      const startDate = new Date(activePlan.startDate || new Date());
      activePlan.weeks.forEach((week, weekIndex) => {
        // Mỗi tuần có 7 ngày
        for (let day = 0; day < 7; day++) {
          const date = new Date(startDate);
          date.setDate(date.getDate() + (weekIndex * 7) + day);
          const dateStr = date.toISOString().split('T')[0];
          dailyTargets[dateStr] = week.amount;
        }
      });
      console.log("Đã tạo bảng tra cứu mục tiêu hàng ngày từ kế hoạch");
    }
    
    // Thử load TẤT CẢ dữ liệu từ DATABASE trước
    let databaseData = {};
    try {
      const userId = localStorage.getItem('user_id') || localStorage.getItem('userId') || 
                    JSON.parse(localStorage.getItem('user') || '{}')?.id;
      
      if (userId) {
        console.log(`📊 Đang load tất cả dữ liệu progress từ database cho user ${userId}...`);
        const response = await fetch(`/api/progress/${userId}`);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data && result.data.length > 0) {
            // Chuyển đổi thành object với key là date để tra cứu nhanh
            result.data.forEach(item => {
              const dateStr = item.date.split('T')[0];
              databaseData[dateStr] = item;
            });
            console.log(`✅ Đã load ${result.data.length} bản ghi từ database`);
          }
        }
      }
    } catch (dbError) {
      console.log(`ℹ️ Không thể load từ database:`, dbError.message);
    }
    
    // Tính số ngày từ khi bắt đầu kế hoạch đến hôm nay
    const daysSincePlanStart = Math.floor((today - planStartDate) / (1000 * 60 * 60 * 24));
    const maxDaysToLoad = Math.max(0, daysSincePlanStart + 1);
    
    console.log(`Xử lý dữ liệu cho ${maxDaysToLoad} ngày từ khi bắt đầu kế hoạch`);
    
    // Duyệt từ ngày bắt đầu kế hoạch đến hôm nay
    for (let i = maxDaysToLoad - 1; i >= 0; i--) {
      try {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Chỉ xử lý dữ liệu nếu ngày đó >= ngày bắt đầu kế hoạch
        if (date >= planStartDate) {
          let checkinFound = false;
          
          // Kiểm tra trong database data trước
          if (databaseData[dateStr]) {
            const dbData = databaseData[dateStr];
            const targetCigs = dbData.target_cigarettes || dailyTargets[dateStr] || 
                              (activePlan?.initialCigarettes || 0);
            
            actualData.push({
              date: dateStr,
              actualCigarettes: dbData.actual_cigarettes,
              targetCigarettes: targetCigs,
              mood: dbData.mood,
              achievements: dbData.achievements || [],
              challenges: dbData.challenges || []
            });
            
            console.log(`✅ DATABASE: ${dateStr} -> ${dbData.actual_cigarettes} điếu (target: ${targetCigs})`);
            checkinFound = true;
          } else {
            // Fallback: Load từ localStorage nếu không tìm thấy trong database
            const checkinData = localStorage.getItem(`checkin_${dateStr}`);
            if (checkinData) {
              const data = JSON.parse(checkinData);
              
              const targetCigs = data.targetCigarettes || dailyTargets[dateStr] || 
                                (activePlan?.initialCigarettes || 0);
              
              actualData.push({
                date: dateStr,
                actualCigarettes: data.actualCigarettes,
                targetCigarettes: targetCigs,
                mood: data.mood,
                achievements: data.achievements || [],
                challenges: data.challenges || []
              });
              console.log(`📱 LOCALSTORAGE: ${dateStr} -> ${data.actualCigarettes} điếu (target: ${targetCigs})`);
              checkinFound = true;
            }
          }
          
          // Nếu vẫn không có dữ liệu nhưng có mục tiêu, thêm mục tiêu vào
          if (!checkinFound && dailyTargets[dateStr] !== undefined) {
            actualData.push({
              date: dateStr,
              actualCigarettes: null,
              targetCigarettes: dailyTargets[dateStr],
              mood: null
            });
            console.log(`⚪ TARGET ONLY: ${dateStr} -> target: ${dailyTargets[dateStr]} điếu`);
          }
        }
      } catch (error) {
        console.error(`Error processing data for day -${i}:`, error);
      }
    }
    
    // Đảm bảo dữ liệu được sắp xếp theo ngày tăng dần
    actualData.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Fix: Chuyển đổi định dạng dữ liệu cho phù hợp với QuitProgressChart
    const formattedActualData = actualData.map(item => ({
      date: item.date,
      actualCigarettes: item.actualCigarettes,
      targetCigarettes: item.targetCigarettes,
      mood: item.mood,
      // Các trường khác nếu cần
      achievements: item.achievements,
      challenges: item.challenges
    }));
    
    console.log(`Đã tải và định dạng ${formattedActualData.length} bản ghi dữ liệu thực tế`);
    setActualProgress(formattedActualData);
    
    // Thêm dữ liệu từ API nếu người dùng đã đăng nhập
    try {
      const auth_token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      if (auth_token) {
        console.log("Người dùng đã đăng nhập, lấy thêm dữ liệu từ API...");
        const apiProgress = await progressService.getUserProgress();
        if (apiProgress && apiProgress.data && Array.isArray(apiProgress.data)) {
          console.log("Đã nhận dữ liệu từ API:", apiProgress.data.length, "bản ghi");
          
          // Tạo map của dữ liệu hiện có theo ngày
          const existingDataMap = {};
          actualData.forEach(item => {
            existingDataMap[item.date] = item;
          });
          
          // Thêm hoặc cập nhật dữ liệu từ API
          apiProgress.data.forEach(apiItem => {
            if (existingDataMap[apiItem.date]) {
              // Cập nhật dữ liệu hiện có
              const existingItem = existingDataMap[apiItem.date];
              existingItem.actualCigarettes = apiItem.actualCigarettes;
              if (!existingItem.targetCigarettes || existingItem.targetCigarettes === 0) {
                existingItem.targetCigarettes = apiItem.targetCigarettes;
              }
            } else {
              // Thêm mới
              actualData.push({
                date: apiItem.date,
                actualCigarettes: apiItem.actualCigarettes,
                targetCigarettes: apiItem.targetCigarettes || dailyTargets[apiItem.date] || 0,
                mood: null
              });
            }
          });
          
          // Sắp xếp lại
          actualData.sort((a, b) => new Date(a.date) - new Date(b.date));
        }
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu từ API:", error);
    }
    
    console.log(`Đã tải ${actualData.length} bản ghi dữ liệu thực tế`);
    setActualProgress(actualData);
  };    // Xử lý cập nhật tiến trình từ Daily Checkin
  const handleProgressUpdate = async (newProgress) => {
    console.log('Progress updated:', newProgress);
    console.log('PROGRESS DEBUG: Received new progress with date:', newProgress.date);
    
    // Load lại actual progress từ localStorage để lấy dữ liệu mới nhất
    const actualData = [];
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    console.log(`PROGRESS DEBUG: Ngày hôm nay là ${todayStr}, đang tìm dữ liệu mới nhất...`);
    
    // Lấy ngày bắt đầu kế hoạch từ activePlan
    let planStartDate = null;
    try {
      const activePlanData = localStorage.getItem('activePlan');
      if (activePlanData) {
        const activePlan = JSON.parse(activePlanData);
        planStartDate = activePlan.startDate ? new Date(activePlan.startDate) : null;
      }
    } catch (error) {
      console.error('Lỗi khi đọc ngày bắt đầu từ activePlan:', error);
    }
    
    // Nếu không có ngày bắt đầu, chỉ lấy dữ liệu từ hôm nay
    if (!planStartDate) {
      planStartDate = new Date();
      console.log("Không tìm thấy ngày bắt đầu kế hoạch, chỉ tải dữ liệu hôm nay");
    }
    
    console.log(`Kế hoạch bắt đầu từ: ${planStartDate.toISOString().split('T')[0]}`);
    
    // Tính số ngày từ khi bắt đầu kế hoạch đến hôm nay
    const daysSincePlanStart = Math.floor((today - planStartDate) / (1000 * 60 * 60 * 24));
    const maxDaysToLoad = Math.max(0, daysSincePlanStart + 1); // +1 để bao gồm ngày bắt đầu
    
    console.log(`Tải dữ liệu cho ${maxDaysToLoad} ngày từ khi bắt đầu kế hoạch`);
    
    // Duyệt từ ngày bắt đầu kế hoạch đến hôm nay
    for (let i = maxDaysToLoad - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Chỉ tải dữ liệu nếu ngày đó >= ngày bắt đầu kế hoạch
      if (date >= planStartDate) {
        const checkinData = localStorage.getItem(`checkin_${dateStr}`);
        if (checkinData) {
          try {
            const data = JSON.parse(checkinData);
            if (data && typeof data === 'object') {
              actualData.push({
                date: dateStr,
                actualCigarettes: data.actualCigarettes,
                targetCigarettes: data.targetCigarettes,
                mood: data.mood,
                achievements: data.achievements || [],
                challenges: data.challenges || []
              });
              console.log(`Loaded data for ${dateStr}:`, data.actualCigarettes, data.targetCigarettes);
            }
          } catch (error) {
            console.error(`Error parsing data for ${dateStr}:`, error);
          }
        }
      }
    }
    
    // Đảm bảo dữ liệu được sắp xếp theo ngày tăng dần
    actualData.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    console.log('Updated actual progress data:', actualData);
    // Cập nhật state để trigger re-render của biểu đồ
    setActualProgress(actualData);      // Sau khi cập nhật actual progress, tính toán lại các thống kê
      setTimeout(() => {
        // Dùng setTimeout để đảm bảo actualProgress đã được cập nhật
        const updatedStats = recalculateStatistics();
        console.log('Đã cập nhật thống kê dashboard:', updatedStats);
        
        // Log để kiểm tra dữ liệu biểu đồ sau khi cập nhật
        console.log('DEBUG: actualProgress sau khi cập nhật:', actualData);
        console.log('DEBUG: Dòng xanh lá phải hiển thị với dữ liệu này');
      
      // Kiểm tra lại dữ liệu từ localStorage để xác nhận 100%
      const todayDateStr = new Date().toISOString().split('T')[0];
      const todayData = localStorage.getItem(`checkin_${todayDateStr}`);
      
      if (todayData) {
        const parsedData = JSON.parse(todayData);
        console.log(`DEBUG: ✅ Xác nhận ngày hôm nay (${todayDateStr}) có dữ liệu: ${parsedData.actualCigarettes} điếu`);
        
        // Kiểm tra trong actualData có ngày hôm nay không
        const hasTodayInData = actualData.some(item => item.date === todayDateStr);
        if (!hasTodayInData) {
          console.log(`❌ CẢNH BÁO: Dữ liệu hôm nay có trong localStorage nhưng không có trong actualData!`);
        }
      } else {
        console.log(`DEBUG: ❌ Không tìm thấy dữ liệu cho ngày hôm nay (${todayDateStr}) trong localStorage`);
      }
    }, 0);
  };
  
  // Xử lý cập nhật tâm trạng từ Mood Tracking
  const handleMoodUpdate = (newMoodData) => {
    console.log('Mood updated:', newMoodData);
    // Có thể thêm logic cập nhật mood data ở đây nếu cần
    setMoodData(prev => [...prev, newMoodData]);
  };
  
  // Check for plan completion data on component mount
  useEffect(() => {
    const savedCompletion = localStorage.getItem('quitPlanCompletion');
    if (savedCompletion) {
      const completion = JSON.parse(savedCompletion);
      setCompletionData(completion);
      setShowCompletionDashboard(true);
    }
  }, []);
  
  // Recalculate statistics whenever actualProgress changes
  useEffect(() => {
    console.log("actualProgress changed, recalculating statistics...");
    // Recalculate even if there's no data, to reset stats if needed
    recalculateStatistics();
  }, [actualProgress]);
  
  // Không chuyển hướng tự động, chỉ hiển thị nút cho người dùng
  useEffect(() => {    
    if (userPlan) {
      // Chỉ kiểm tra xem có kế hoạch và cập nhật state
      console.log("Đã kiểm tra kế hoạch:", hasPlan ? "Có kế hoạch" : "Không có kế hoạch");
    }
  }, [userPlan, hasPlan]);
    // Tính toán lại tất cả các thống kê và cập nhật state
  const recalculateStatistics = () => {
    console.log("======= BẮT ĐẦU TÍNH TOÁN THỐNG KÊ MỚI =======");
    
    // Tính số ngày đã check-in (tính bằng số ngày đã lưu DailyCheckin)
    const currentDate = new Date();
    const noSmokingDays = actualProgress.length; // Số lần người dùng đã lưu DailyCheckin
    
    // Hiển thị tất cả dữ liệu check-in hiện có
    console.log("Dữ liệu check-in hiện có:", actualProgress);
    
    // Lấy số điếu ban đầu chính xác từ kế hoạch và activePlan
    let initialCigarettesPerDay = 0;
    
    // Ưu tiên lấy từ activePlan vì đó là nơi lưu giá trị người dùng nhập
    try {
      const activePlanData = localStorage.getItem('activePlan');
      if (activePlanData) {
        const activePlan = JSON.parse(activePlanData);
        if (activePlan && activePlan.initialCigarettes) {
          initialCigarettesPerDay = activePlan.initialCigarettes;
          console.log(`Lấy số điếu ban đầu từ activePlan: ${initialCigarettesPerDay}`);
        }
      }
    } catch (error) {
      console.error('Lỗi khi đọc initialCigarettes từ activePlan:', error);
    }
    
    // Nếu không có trong activePlan, thử lấy từ userPlan
    if (!initialCigarettesPerDay) {
      initialCigarettesPerDay = userPlan?.initialCigarettes || 
                              (userPlan?.weeks && userPlan.weeks.length > 0 ? userPlan.weeks[0].amount : 22);
    }
    
    console.log(`Số điếu ban đầu được sử dụng: ${initialCigarettesPerDay} điếu/ngày`);
    
    // Chỉ tìm check-in của hôm nay
    const todayDateStr = new Date().toISOString().split('T')[0];
    const todayRecord = actualProgress.find(day => day.date === todayDateStr);
    
    // Tính số điếu đã tránh tích lũy cho TẤT CẢ các ngày có check-in
    let savedCigarettes = 0;
    let dailySavings = [];
    let detailedLog = '';
    
    // Lấy số điếu ban đầu từ activePlan trong localStorage nếu có
    let userInitialCigarettes = initialCigarettesPerDay;
    try {
      const activePlanData = localStorage.getItem('activePlan');
      if (activePlanData) {
        const activePlan = JSON.parse(activePlanData);
        if (activePlan && activePlan.initialCigarettes) {
          userInitialCigarettes = activePlan.initialCigarettes;
          console.log(`Lấy số điếu ban đầu từ activePlan: ${userInitialCigarettes}`);
        }
      }
    } catch (error) {
      console.error('Lỗi khi đọc initialCigarettes từ activePlan:', error);
    }
    
    // Biến để lưu số điếu đã tránh tích lũy
    let totalSavedCigarettes = 0;
    
    // Tính số điếu đã tránh cho TẤT CẢ các ngày có trong actualProgress
    detailedLog = '';
    
    // Tính toán số điếu đã tránh cho mỗi ngày và tích lũy tổng số
    actualProgress.forEach(dayRecord => {
      // Số điếu đã tránh trong ngày = target theo plan - số điếu thực tế
      // Sử dụng targetCigarettes từ progress data thay vì userInitialCigarettes
      const targetForDay = dayRecord.targetCigarettes || dayRecord.target_cigarettes || userInitialCigarettes;
      const daySaved = Math.max(0, targetForDay - dayRecord.actualCigarettes);
      totalSavedCigarettes += daySaved;
      
      // Ghi chi tiết để debug
      detailedLog += `\n- Ngày ${dayRecord.date}: Target: ${targetForDay}, Actual: ${dayRecord.actualCigarettes} = Tránh được: ${daySaved} điếu`;
      
      // Lưu thông tin chi tiết
      dailySavings.push({
        date: dayRecord.date,
        actual: dayRecord.actualCigarettes,
        targetFromPlan: targetForDay,
        userInitialCigarettes: userInitialCigarettes,
        saved: daySaved
      });
    });
    
    // Thiết lập giá trị cuối cùng
    savedCigarettes = totalSavedCigarettes;
    
    console.log(`Chi tiết điếu thuốc đã tránh theo ngày:${detailedLog}`);
    console.log(`TỔNG SỐ ĐIẾU ĐÃ TRÁNH TÍCH LŨY: ${savedCigarettes} điếu`);
    console.log("Chi tiết các ngày:", dailySavings);
      // Tính số tiền tiết kiệm dựa trên giá gói thuốc từ kế hoạch của người dùng
    let packPrice = 25000; // Giá mặc định nếu không tìm thấy
    
    // Lấy giá gói thuốc từ activePlan
    try {
      const activePlanData = localStorage.getItem('activePlan');
      if (activePlanData) {
        const activePlan = JSON.parse(activePlanData);
        if (activePlan && activePlan.packPrice) {
          packPrice = activePlan.packPrice;
          console.log(`Lấy giá gói thuốc từ activePlan: ${packPrice.toLocaleString()}đ`);
        }
      }
    } catch (error) {
      console.error('Lỗi khi đọc packPrice từ activePlan:', error);
    }
    
    const pricePerCigarette = packPrice / 20; // Giả sử 1 gói = 20 điếu
    const savedMoney = savedCigarettes * pricePerCigarette;
    
    // Tính milestone sức khỏe đạt được
    // Milestone theo thời gian WHO
    const healthMilestones = [
      { days: 1, title: '24 giờ đầu tiên', description: 'Carbon monoxide được loại bỏ khỏi cơ thể' },
      { days: 2, title: '48 giờ', description: 'Nicotine được loại bỏ, vị giác cải thiện' },
      { days: 3, title: '72 giờ', description: 'Đường hô hấp thư giãn, năng lượng tăng' },
      { days: 14, title: '2 tuần', description: 'Tuần hoàn máu cải thiện' },
      { days: 30, title: '1 tháng', description: 'Chức năng phổi tăng 30%' },
      { days: 90, title: '3 tháng', description: 'Ho và khó thở giảm đáng kể' },
      { days: 365, title: '1 năm', description: 'Nguy cơ bệnh tim giảm 50%' }
    ];
    
    // Tìm ngày đầu tiên có check-in để tính số ngày đã bắt đầu
    let daysInPlan = 0;
    if (actualProgress.length > 0) {
      const oldestRecord = new Date(actualProgress[0].date);
      daysInPlan = Math.floor((currentDate - oldestRecord) / (1000 * 60 * 60 * 24)) + 1;
    }
    
    // Đếm số milestone đã đạt được
    const achievedMilestones = healthMilestones.filter(m => daysInPlan >= m.days).length;
    const healthProgress = Math.round((achievedMilestones / healthMilestones.length) * 100);
    
    console.log(`Thống kê mới: ${noSmokingDays} ngày không hút, ${savedCigarettes} điếu đã tránh, ${savedMoney.toFixed(0)}đ tiết kiệm, tiến độ sức khỏe ${healthProgress}%`);
    
    // Cập nhật state với thống kê mới
    const newStats = {
      noSmokingDays,
      savedCigarettes,
      savedMoney,
      healthProgress,
      // Thêm thông tin chi tiết để debugging
      calculationDetails: {
        initialCigarettesPerDay,
        dailySavings,
        lastCalculated: new Date().toISOString(),
        debug: {
          actualData: todayRecord ? {
            date: todayDateStr,
            actualCigarettes: todayRecord.actualCigarettes,
            targetCigarettes: todayRecord.targetCigarettes
          } : "Chưa có check-in hôm nay",
          savedCalcDesc: `${initialCigarettesPerDay} - ${todayRecord?.actualCigarettes || 0} = ${savedCigarettes} điếu`
        }
      }
    };
    
    console.log("Đang cập nhật state với thống kê mới:", newStats);
    console.log("QUAN TRỌNG - Số điếu đã tránh mới: " + savedCigarettes);
    
    // Cập nhật state
    setDashboardStats(newStats);
    
    // Lưu vào localStorage để sử dụng giữa các phiên - xóa trước để đảm bảo không giữ lại dữ liệu cũ
    localStorage.removeItem('dashboardStats');
    localStorage.setItem('dashboardStats', JSON.stringify(newStats));
    
    console.log("======= KẾT THÚC TÍNH TOÁN THỐNG KÊ =======");
    
    return newStats;
  };
  
  if (!userPlan) {
    return (
      <div className="progress-container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Đang tải kế hoạch của bạn...</p>
        </div>
      </div>
    );
  }
    // Kiểm tra xem có cần hiển thị thông báo cần lập kế hoạch
  if (!hasPlan) {
    return (
      <div className="progress-container">
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center', 
          padding: '3rem',
          maxWidth: '600px',
          margin: '0 auto',
          backgroundColor: 'white',
          borderRadius: '10px',
          boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
          marginTop: '2rem' 
        }}>          <h2 style={{
            fontSize: '1.8rem',
            marginBottom: '1.5rem',
            color: '#2c3e50',
            textAlign: 'center',
            width: '100%',
            position: 'relative',
            fontWeight: '600',
            display: 'inline-block'
          }}>
            <span style={{ position: 'relative', zIndex: '1' }}>
              Bạn cần lập kế hoạch cai thuốc
              <span style={{ 
                position: 'absolute', 
                height: '3px', 
                width: '100px', 
                background: '#3498db', 
                bottom: '-10px', 
                left: '50%', 
                transform: 'translateX(-50%)',
                borderRadius: '2px'
              }}></span>
            </span>
          </h2>
          <p style={{
            fontSize: '1.1rem',
            marginBottom: '2rem',
            color: '#7f8c8d',
            lineHeight: '1.6',
            textAlign: 'center',
            maxWidth: '90%'
          }}>
            Để theo dõi tiến trình cai thuốc, hãy lập một kế hoạch phù hợp với mục tiêu 
            và khả năng của bạn. Kế hoạch này sẽ giúp bạn duy trì động lực và đo lường 
            sự tiến bộ hàng ngày.
          </p>          <a 
            href="/journey"
            style={{
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '30px',
              padding: '12px 25px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textDecoration: 'none',
              display: 'block',
              margin: '0 auto',
              width: 'fit-content',
              textAlign: 'center'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#2980b9'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#3498db'}
          >
            Lập kế hoạch cai thuốc ngay
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="progress-container">
      <h1 className="page-title">
        {showCompletionDashboard ? 'Chúc mừng! Bạn đã lập kế hoạch cai thuốc' : 'Tiến trình cai thuốc hiện tại'}
      </h1>
      
      {/* Daily Checkin Section - Luôn hiển thị để người dùng có thể nhập số điếu đã hút */}
      <DailyCheckin 
        onProgressUpdate={handleProgressUpdate}
      />
        {/* Luôn hiển thị ProgressDashboard */}
        <ProgressDashboard 
          userPlan={userPlan} 
          completionDate={completionData?.completionDate || new Date().toISOString()}
          dashboardStats={dashboardStats}
          actualProgress={actualProgress} // Truyền dữ liệu thực tế vào ProgressDashboard
          onDataReset={() => {
            // Reset data & recalculate
            localStorage.removeItem('dashboardStats');
            loadActualProgressFromCheckins();
            recalculateStatistics();
          }}
        />
    </div>
  );
}

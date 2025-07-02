import React, { useState, useEffect } from "react";
import {
  FaUserAlt,
  FaChartLine,
  FaCalendarAlt,
  FaHeartbeat,
  FaTrophy,
  FaComment,
  FaHeart,
  FaCheckCircle,
  FaExclamationCircle,
  FaCog,
  FaBell,
  FaCrown,
  FaTimes,
  FaSignOutAlt,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaTransgender,
  FaLock,
  FaEdit,  FaSave,
  FaImage,
  FaCheck,
  FaClipboardList,
  FaArrowRight,
} from "react-icons/fa";

import "./Profile.css";
import "./membership.css";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import AppointmentList from "../components/AppointmentList";
import QuitPlanDisplay from "../components/QuitPlanDisplay";
import DailyCheckin from "../components/DailyCheckin";
import UserProfile from "./User.jsx";
import Achievement from "../components/Achievement.jsx";
import CollapsibleSection from "../components/CollapsibleSection.jsx";
import HealthProfile from "../components/HealthProfile.jsx";
import ProfilePlan from "../components/ProfilePlan.jsx";
import "../styles/CollapsibleSection.css";
import "../styles/HealthProfile.css";
import "../styles/ProfilePlan.css";
import "../styles/ModalStyles.css";
import "../styles/JournalEntry.css";
import "../styles/ProgressTracker.css";

// Component Modal chỉnh sửa kế hoạch
function PlanEditModal({ isOpen, onClose, currentPlan, activePlan, onSave }) {
  // Khi modal mở, thêm class vào body
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    
    // Cleanup khi component unmount
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);
  
  const [planData, setPlanData] = useState({
    strategy: activePlan?.strategy || currentPlan.strategy || "Cai thuốc hoàn toàn và duy trì lâu dài",
    startDate: (() => {
      try {
        if (activePlan?.startDate) {
          const date = new Date(activePlan.startDate);
          if (!isNaN(date.getTime())) {
            return date.toISOString().split("T")[0];
          }
        }
        
        if (currentPlan?.startDate) {
          // Kiểm tra nếu startDate là định dạng DD/MM/YYYY
          if (typeof currentPlan.startDate === 'string' && currentPlan.startDate.includes('/')) {
            const parts = currentPlan.startDate.split('/');
            if (parts.length === 3) {
              // Nếu định dạng là DD/MM/YYYY
              const day = parseInt(parts[0], 10);
              const month = parseInt(parts[1], 10) - 1; // Trừ 1 vì tháng trong JS bắt đầu từ 0
              const year = parseInt(parts[2], 10);
              const formattedDate = new Date(year, month, day);
              if (!isNaN(formattedDate.getTime())) {
                return formattedDate.toISOString().split("T")[0];
              }
            }
          }
        }
        
        // Mặc định trả về ngày hiện tại nếu không có ngày hợp lệ khác
        return new Date().toISOString().split("T")[0];
      } catch (error) {
        console.error("Lỗi khi xử lý ngày:", error);
        return new Date().toISOString().split("T")[0];
      }
    })(),
    goal: activePlan?.goal || currentPlan.goal || "Cai thuốc hoàn toàn và duy trì lâu dài",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPlanData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(planData);
    onClose();
  };
  if (!isOpen) return null;
  // Bắt sự kiện click trên overlay để đóng modal
  const handleOverlayClick = (e) => {
    // Check if the click was directly on the overlay (not on its children)
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Điều chỉnh kế hoạch cai thuốc</h2>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Phương pháp cai thuốc</label>
            <select
              name="strategy"
              value={planData.strategy}
              onChange={handleChange}
              className="form-control"
            >
              <option value="Cai thuốc hoàn toàn và duy trì lâu dài">
                Cai thuốc hoàn toàn
              </option>
              <option value="Giảm dần số điếu thuốc">Giảm dần số điếu thuốc</option>
              <option value="Sử dụng sản phẩm thay thế nicotine">
                Sử dụng sản phẩm thay thế nicotine
              </option>
            </select>
          </div>

          <div className="form-group">
            <label>Ngày bắt đầu</label>
            <input
              type="date"
              name="startDate"
              value={planData.startDate}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>Mục tiêu</label>
            <textarea
              name="goal"
              value={planData.goal}
              onChange={handleChange}
              rows="3"
              className="form-control"
            ></textarea>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="save-btn">
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Component cập nhật hàng ngày
export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isPlanEditOpen, setIsPlanEditOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const notificationCount = 0; // nếu bạn có biến này thì replace theo đúng giá trị  
  
  // Handle logout with navigation
  const handleLogout = () => {
    logout();
    navigate('/login');
  };// Check if redirected from appointment booking
  useEffect(() => {
    const savedTab = localStorage.getItem('activeProfileTab');
    if (savedTab) {
      setActiveTab(savedTab);
      // Clear the saved tab after using it
      localStorage.removeItem('activeProfileTab');
      
      // Scroll to the top of the content area
      const profileContent = document.querySelector('.profile-content');
      if (profileContent) {
        window.scrollTo({ top: profileContent.offsetTop, behavior: 'smooth' });
      }
    }
    
    // Check for hash in URL to navigate to specific section
    if (window.location.hash) {
      const hash = window.location.hash.substring(1); // remove the # symbol
      if (hash === 'achievements' || hash === 'profile' || hash === 'appointments' || hash === 'journal' || hash === 'membership' || hash === 'health') {
        setActiveTab(hash === 'health' ? 'profile' : hash);
        
        // Scroll to the top of the content area
        window.scrollTo({ top: 0, behavior: 'auto' });
        
        // Use setTimeout to ensure the DOM has updated after the tab change
        setTimeout(() => {
          const profileContent = document.querySelector('.profile-content');
          if (profileContent) {
            window.scrollTo({ top: profileContent.offsetTop, behavior: 'auto' });
          }
          
          // If it's the health section, scroll to that section
          if (hash === 'health') {
            setTimeout(() => {
              const healthSection = document.querySelector('.health-section');
              if (healthSection) {
                healthSection.scrollIntoView({ behavior: 'smooth' });
              }
            }, 100);
          }
        }, 100);
      }
    }  }, []);
  
  const [activePlan, setActivePlan] = useState(null);
    useEffect(() => {
    // Tải kế hoạch cai thuốc từ localStorage
    try {
      // Kiểm tra kế hoạch đã hoàn thành
      const completionData = localStorage.getItem('quitPlanCompletion');
      if (completionData) {
        const parsedData = JSON.parse(completionData);
        setActivePlan(parsedData.userPlan);
        return;
      }

      // Nếu chưa hoàn thành, tải kế hoạch đang thực hiện
      const savedPlan = localStorage.getItem('activePlan');
      if (savedPlan) {
        const parsedPlan = JSON.parse(savedPlan);
        setActivePlan(parsedPlan);
      }    } catch (error) {
      console.error('Lỗi khi đọc kế hoạch cai thuốc:', error);
    }
  }, []);
  
  // Tính toán các giá trị - chuyển xuống dưới useEffect để đảm bảo activePlan đã được cập nhật
  const calculateSavings = () => {
    if (!user) return { days: 0, money: 0, cigarettes: 0 };

    // Sử dụng ngày bắt đầu từ kế hoạch cai thuốc nếu có
    let startDate;
    try {
      // Dùng optional chaining để tránh lỗi khi activePlan là null
      if (activePlan?.startDate) {
        startDate = new Date(activePlan.startDate);
        
        // Kiểm tra ngày có hợp lệ không
        if (isNaN(startDate.getTime())) {
          console.warn("Ngày bắt đầu từ activePlan không hợp lệ:", activePlan.startDate);
          startDate = user?.startDate ? new Date(user.startDate) : new Date();
        }
      } else if (user?.startDate) {
        startDate = new Date(user.startDate);
        if (isNaN(startDate.getTime())) {
          console.warn("Ngày bắt đầu từ user không hợp lệ:", user.startDate);
          startDate = new Date();
        }
      } else {
        startDate = new Date();
      }
    } catch (error) {
      console.error("Lỗi khi xử lý ngày bắt đầu:", error);
      startDate = new Date();
    }
    
    const now = new Date();
    const days = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));

    // Số điếu thuốc mỗi ngày từ kế hoạch hoặc từ thông tin người dùng
    const cigarettesPerDay = activePlan?.initialCigarettes || 
                            (activePlan?.weeks && activePlan.weeks[0]?.amount) || 
                            user?.cigarettesPerDay || 20;
    
    const costPerDay = user?.costPerPack && user?.cigarettesPerPack ? 
      (user.costPerPack / user.cigarettesPerPack) * cigarettesPerDay : 30000;
    
    const moneySaved = days * costPerDay;
    const cigarettesSaved = days * cigarettesPerDay;

    return {
      days: days > 0 ? days : 0,
      money: moneySaved > 0 ? moneySaved : 0,
      cigarettes: cigarettesSaved > 0 ? cigarettesSaved : 0,
    };
  };

  // Đảm bảo giá trị savings được tính sau khi activePlan đã được cập nhật
  const savings = calculateSavings();
  // Hàm định dạng ngày tháng
  const formatDate = (dateString) => {
    try {
      if (!dateString) return "01/05/2023"; // Default date
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn("Ngày không hợp lệ:", dateString);
        return "01/05/2023";
      }
      
      return date.toLocaleDateString("vi-VN");
    } catch (error) {
      console.error("Lỗi khi định dạng ngày:", error);
      return "01/05/2023";
    }
  };
  
  // Dữ liệu người dùng mẫu - chỉ sử dụng cho các giá trị không có trong user
  const userData = {
    ...user,
    avatar: user?.avatar || "/image/hero/quit-smoking-2.png",
    daysWithoutSmoking: savings.days,
    moneySaved: savings.money,
    pointsEarned: savings.cigarettes,
    startDate: formatDate(user?.startDate),
    cigarettesPerDay: user?.cigarettesPerDay || 20,
    costPerDay:
      (user?.costPerPack / user?.cigarettesPerPack) * user?.cigarettesPerDay ||
      30000,
    yearsOfSmoking: 8,
    fagerstromScore: "8/10",
    healthImprovements: [
      {
        time: "20 phút",
        description: "Huyết áp và nhịp tim trở về bình thường",
        completed: savings.days > 0,
      },
      {
        time: "24 giờ",
        description: "CO trong máu giảm về mức bình thường",
        completed: savings.days >= 1,
      },
      {
        time: "48 giờ",
        description: "Nicotine đã rời khỏi cơ thể",
        completed: savings.days >= 2,
      },
      {
        time: "72 giờ",
        description: "Hô hấp dễ dàng hơn",
        completed: savings.days >= 3,
      },
      {
        time: "2-12 tuần",
        description: "Tuần hoàn máu cải thiện",
        completed: savings.days >= 14,
      },
    ],
    milestones: [
      {
        id: 1,
        name: "Chuẩn bị cai thuốc",
        date: new Date(
          new Date(user?.startDate).getTime() - 86400000
        ).toLocaleDateString("vi-VN"),
        completed: true,
      },
      {
        id: 2,
        name: "Ngày đầu tiên không hút thuốc",
        date: new Date(user?.startDate).toLocaleDateString("vi-VN"),
        completed: savings.days >= 1,
      },
      {
        id: 3,
        name: "Tuần đầu tiên không hút thuốc",
        date: new Date(
          new Date(user?.startDate).getTime() + 7 * 86400000
        ).toLocaleDateString("vi-VN"),
        completed: savings.days >= 7,
      },
      {
        id: 4,
        name: "Duy trì 3 tháng không hút thuốc",
        progress: `${Math.min(savings.days, 90)}/90 ngày`,
        completed: savings.days >= 90,
      },
    ],
    achievements: [
      {
        id: 1,
        name: "24 giờ đầu tiên",
        date:
          savings.days >= 1
            ? new Date(
                new Date(user?.startDate).getTime() + 86400000
              ).toLocaleDateString("vi-VN")
            : "",
        icon: "⭐",
      },
      {
        id: 2,
        name: "1 tuần không hút",
        date:
          savings.days >= 7
            ? new Date(
                new Date(user?.startDate).getTime() + 7 * 86400000
              ).toLocaleDateString("vi-VN")
            : "",
        icon: "🏅",
      },
      {
        id: 3,
        name: "2 tuần không hút",
        date:
          savings.days >= 14
            ? new Date(
                new Date(user?.startDate).getTime() + 14 * 86400000
              ).toLocaleDateString("vi-VN")
            : "",
        icon: "🏆",
      },
      {
        id: 4,
        name: "1 tháng không hút",
        date:
          savings.days >= 30
            ? new Date(
                new Date(user?.startDate).getTime() + 30 * 86400000
              ).toLocaleDateString("vi-VN")
            : "",
        icon: "👑",
      },
    ],
    journalEntries: [
      {
        id: 1,
        day: savings.days,
        date: "Hôm nay",
        mood: "Bình thường",
        symptoms: "Không có triệu chứng",
        notes: '"Hôm nay là một ngày bình thường, không có cảm giác thèm thuốc."',
      },
      {
        id: 2,
        day: savings.days - 1,
        date: "Hôm qua",
        mood: "Tốt",
        symptoms: "Không có triệu chứng",
        notes:
          '"Cảm thấy rất tự hào về bản thân, hôm nay tôi đã từ chối một điếu thuốc từ đồng nghiệp."',
      },
    ],
  };
  // Xử lý cập nhật hôm nay
  const handleUpdateToday = (updateData) => {
    console.log("Cập nhật mới:", updateData);
    alert("Đã lưu cập nhật của bạn!");
  };
  // Xử lý lưu kế hoạch
  const handleSavePlan = (planData) => {
    try {
      // Lấy kế hoạch cài đặt hiện tại từ localStorage
      let currentPlanData;
      const completionData = localStorage.getItem('quitPlanCompletion');
      if (completionData) {
        const parsedData = JSON.parse(completionData);
        currentPlanData = parsedData.userPlan;
      } else {
        const savedPlan = localStorage.getItem('activePlan');
        if (savedPlan) {
          currentPlanData = JSON.parse(savedPlan);
        }
      }
      
      // Kiểm tra và chuẩn hóa định dạng ngày tháng
      let validStartDate = planData.startDate;
      try {
        // Đảm bảo rằng startDate là một chuỗi ngày tháng hợp lệ
        const date = new Date(planData.startDate);
        if (!isNaN(date.getTime())) {
          // Lưu trữ theo định dạng ISO để đảm bảo tính nhất quán
          validStartDate = date.toISOString();
        } else {
          console.error("Ngày không hợp lệ:", planData.startDate);
          validStartDate = new Date().toISOString();
        }
      } catch (error) {
        console.error("Lỗi khi xử lý ngày:", error);
        validStartDate = new Date().toISOString();
      }
      
      // Cập nhật thông tin mới vào kế hoạch
      if (currentPlanData) {
        const updatedPlan = {
          ...currentPlanData,
          strategy: planData.strategy,
          goal: planData.goal,
          startDate: validStartDate
        };
        
        // Lưu lại vào localStorage
        if (completionData) {
          const updatedCompletion = JSON.parse(completionData);
          updatedCompletion.userPlan = updatedPlan;
          localStorage.setItem('quitPlanCompletion', JSON.stringify(updatedCompletion));
        } else {
          localStorage.setItem('activePlan', JSON.stringify(updatedPlan));
        }
        
        // Cập nhật state
        setActivePlan(updatedPlan);
        alert("Đã lưu cập nhật kế hoạch thành công!");
      } else {
        alert("Không tìm thấy kế hoạch để cập nhật. Vui lòng tạo kế hoạch mới.");
      }
    } catch (error) {
      console.error("Lỗi khi lưu kế hoạch:", error);
      alert("Có lỗi xảy ra khi lưu kế hoạch. Vui lòng thử lại sau.");
    }
  };
  return (
    <div className="profile-container">
      {/* Sidebar */}
      <div className="profile-sidebar">
        <div className="user-info">
          <div className="avatar-circle">
            <div className="user-initial-container">
              <span className="user-initial">{userData.name ? userData.name.charAt(0) : 'U'}</span>
            </div>
          </div>
          <div className="user-details">
            <div className="user-name-wrapper">
              <h3 className="user-name">{userData.name}</h3>
              {userData.membershipType && userData.membershipType !== 'free' && (
                <span className={`membership-label ${userData.membershipType}`}>
                  {userData.membershipType === 'premium' ? 'Premium' : 'Pro'}
                </span>
              )}
            </div>
            <div className="quit-status-container">
              <div className="quit-status-text">
                <span className="status-dot"></span>
                Đang cai thuốc
              </div>
              <div className="quit-days-display">
                <span className="day-count">{userData.daysWithoutSmoking || 5}</span>
                <span className="day-text">ngày</span>
              </div>
            </div>
          </div>
        </div>
        <nav className="profile-nav">
          <Link
            to="#"
            className={`nav-item ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("profile");
              // Scroll to the top of the content area
              const profileContent = document.querySelector('.profile-content');
              if (profileContent) {
                setTimeout(() => {
                  profileContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 10);
              }
            }}
          >
            <FaUserAlt /> Hồ sơ cá nhân
          </Link>

          <Link
            to="#"
            className={`nav-item ${activeTab === "appointments" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("appointments");
              // Scroll to the top of the content area
              const profileContent = document.querySelector('.profile-content');
              if (profileContent) {
                setTimeout(() => {
                  profileContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 10);
              }
            }}
          >
            <FaCalendarAlt /> Lịch hẹn Coach
          </Link>
            <Link
            to="#"
            className={`nav-item ${
              activeTab === "achievements" ? "active" : ""
            }`}
            onClick={() => {
              setActiveTab("achievements");
              // Scroll to the top of the content area
              const profileContent = document.querySelector('.profile-content');
              if (profileContent) {
                setTimeout(() => {
                  profileContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 10);
              }
            }}
          >            <FaTrophy /> Huy hiệu
          </Link>
          <button onClick={logout} className="nav-item logout-btn">
            <FaSignOutAlt /> Đăng xuất
          </button>
        </nav>
      </div>

      {/* Main content */}
      <div className="profile-content">
        {activeTab === "profile" && (
          <div className="profile-overview">
            <div className="section-header">
              <h1>Hồ sơ</h1>
            </div>
            
            <div className="profile-sections">
              {/* Thông tin cá nhân - sử dụng component UserProfile */}
              <div className="profile-main-content">
                <UserProfile isStandalone={false} />
                <div className="action-buttons-container">
                </div>
              </div>
              
              <div className="profile-collapsible-sections">
                {/* Sử dụng CollapsibleSection cho Hồ sơ sức khỏe */}
                <CollapsibleSection 
                  title="Hồ sơ sức khỏe" 
                  icon={<FaHeartbeat />}
                  defaultOpen={false}
                  className="health-collapsible"
                >
                  <HealthProfile 
                    healthData={{
                      stats: {
                        smokingHistory: `${userData.yearsOfSmoking} năm`,
                        dailyConsumption: `${activePlan?.initialCigarettes || userData.cigarettesPerDay} điếu/ngày`,
                        quitAttempts: "2 lần",
                        healthIssues: "Tình trạng sức khỏe ban đầu",
                        bloodPressure: "Chưa cập nhật",
                        heartRate: "Chưa cập nhật",
                        oxygenLevel: "Chưa cập nhật",
                        respiratoryRate: "Chưa cập nhật"
                      },
                      improvements: userData.healthImprovements
                    }}
                  />
                </CollapsibleSection>
                
                {/* Sử dụng CollapsibleSection cho Kế hoạch cai thuốc */}
                <CollapsibleSection 
                  title="Kế hoạch cai thuốc" 
                  icon={<FaClipboardList />}
                  defaultOpen={false}
                  className="plan-collapsible"
                >                  <ProfilePlan 
                    planData={{
                      strategy: activePlan?.strategy || "Cai thuốc hoàn toàn và duy trì lâu dài",
                      startDate: userData.startDate || new Date().toLocaleDateString('vi-VN'),
                      goal: activePlan?.goal || "Cải thiện sức khỏe và tiết kiệm chi phí",
                      milestones: userData.milestones
                    }}
                    onEditClick={() => setIsPlanEditOpen(true)}
                  />
                </CollapsibleSection>
              </div>
            </div>
          </div>
        )}        {activeTab === "membership" && (
          <div className="membership-section">
            <h1>Thông tin Thành viên</h1>

            <div className="membership-status">
              <div className="card membership-status-card">
                <h2>Trạng thái thành viên</h2>
                <div className="membership-status-info">
                  {userData.membershipType && userData.membershipType !== 'free' ? (
                    <div className="current-membership">
                      <div className="membership-badge-large">
                        <FaCrown className={userData.membershipType === "premium" ? "premium-icon" : "pro-icon"} />
                        <span className={`membership-type ${userData.membershipType}`}>
                          {userData.membershipType === "premium" ? "Premium" : "Pro"}
                        </span>
                      </div>
                      <p className="membership-description">
                        {userData.membershipType === "premium" 
                          ? "Bạn đang sử dụng gói Premium với đầy đủ tính năng hỗ trợ." 
                          : "Bạn đang sử dụng gói Pro với đầy đủ tính năng hàng năm."}
                      </p>
                    </div>
                  ) : (
                    <div className="free-membership">
                      <p>Bạn đang sử dụng gói Miễn phí</p>
                      <button className="upgrade-btn" onClick={() => navigate('/membership')}>
                        Nâng cấp ngay
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="membership-features">
              <h2>Tính năng của bạn</h2>
              <div className="feature-list">
                <div className="feature-item">
                  <FaCheck className="feature-check" />
                  <div className="feature-text">
                    <h3>Theo dõi cai thuốc</h3>
                    <p>Theo dõi tiến trình cai thuốc của bạn hàng ngày</p>
                  </div>
                </div>
                <div className="feature-item">
                  <FaCheck className="feature-check" />
                  <div className="feature-text">
                    <h3>Lập kế hoạch cá nhân</h3>
                    <p>Tạo kế hoạch cai thuốc phù hợp với bạn</p>
                  </div>
                </div>
                
                {userData.membershipType && userData.membershipType !== 'free' ? (
                  <>
                    <div className="feature-item">
                      <FaCheck className="feature-check" />
                      <div className="feature-text">
                        <h3>Huy hiệu & cộng đồng</h3>
                        <p>Tham gia cộng đồng và nhận huy hiệu</p>
                      </div>
                    </div>
                    <div className="feature-item">
                      <FaCheck className="feature-check" />
                      <div className="feature-text">
                        <h3>Chat huấn luyện viên</h3>
                        <p>Nhận tư vấn từ huấn luyện viên chuyên nghiệp</p>
                      </div>
                    </div>
                    <div className="feature-item">
                      <FaCheck className="feature-check" />
                      <div className="feature-text">
                        <h3>Video call tư vấn</h3>
                        <p>Tham gia các buổi tư vấn qua video</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="feature-item disabled">
                      <FaTimes className="feature-times" />
                      <div className="feature-text">
                        <h3>Huy hiệu & cộng đồng</h3>
                        <p>Nâng cấp để mở khóa tính năng này</p>
                      </div>
                    </div>
                    <div className="feature-item disabled">
                      <FaTimes className="feature-times" />
                      <div className="feature-text">
                        <h3>Chat huấn luyện viên</h3>
                        <p>Nâng cấp để mở khóa tính năng này</p>
                      </div>
                    </div>
                    <div className="feature-item disabled">
                      <FaTimes className="feature-times" />
                      <div className="feature-text">
                        <h3>Video call tư vấn</h3>
                        <p>Nâng cấp để mở khóa tính năng này</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              {!userData.membershipType || userData.membershipType === 'free' ? (
                <div className="membership-upgrade">
                  <h3>Nâng cấp để sử dụng đầy đủ tính năng</h3>
                  <button className="upgrade-btn-large" onClick={() => navigate('/membership')}>
                    Khám phá gói thành viên
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        )}        {activeTab === "achievements" && (
          <Achievement achievements={userData.achievements} />
        )}

        {activeTab === "appointments" && (
          <div className="appointments-section">
            <h1>Lịch hẹn Coach</h1>
            <AppointmentList />
          </div>
        )}        {activeTab === "journal" && (
          <div className="journal-section">
            <h1>Cập nhật hàng ngày</h1>

            <DailyCheckin
              onProgressUpdate={(data) => {
                console.log("Dữ liệu cập nhật:", data);
                alert("Đã lưu cập nhật của bạn!");
              }}
              currentPlan={activePlan}
            />
          </div>        )}
        
        {/* Modal chỉnh sửa kế hoạch */}
        <PlanEditModal
          isOpen={isPlanEditOpen}
          onClose={() => setIsPlanEditOpen(false)}
          currentPlan={{
            strategy: userData.planStrategy,
            startDate: userData.startDate,
            goal: userData.planGoal,
          }}
          activePlan={activePlan}
          onSave={handleSavePlan}
        />
      </div>
    </div>
  );
}
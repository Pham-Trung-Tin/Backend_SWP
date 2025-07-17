import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaCalendarAlt, FaUsers, FaCheckCircle, FaClock, FaEye } from 'react-icons/fa';
import { getCoachAppointments, updateAppointmentStatus } from '../../utils/coachApiIntegration';
import '../../styles/CoachDashboardNew.css';

function CoachDashboardNew() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
    clients: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'upcoming', 'completed', 'clients'
  const [planInfo, setPlanInfo] = useState({});

  useEffect(() => {
    if (user && user.role === 'coach') {
      loadAppointments();
    }
  }, [user]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await getCoachAppointments();
      console.log('API response for appointments:', response);
      let appointmentsData = [];
      if (response) {
        if (response.data && Array.isArray(response.data)) {
          appointmentsData = response.data;
        } else if (Array.isArray(response)) {
          appointmentsData = response;
        } else if (response.success && response.data) {
          appointmentsData = Array.isArray(response.data) ? response.data : [];
        }
      }
      setAppointments(appointmentsData);
      // Stats
      const now = new Date();
      const upcoming = appointmentsData.filter(a => new Date(a.appointment_time) >= now && a.status === 'confirmed').length;
      const completed = appointmentsData.filter(a => a.status === 'completed').length;
      const clients = new Set(appointmentsData.map(a => a.user_id || a.userId || a.user_email)).size;
      setStats({
        total: appointmentsData.length,
        upcoming,
        completed,
        clients
      });
      // Recent bookings
      const sorted = [...appointmentsData].sort((a, b) => new Date(b.appointment_time) - new Date(a.appointment_time)).slice(0, 5);
      setRecentBookings(sorted);
    } catch (error) {
      console.error('Lỗi khi lấy lịch hẹn:', error);
      setAppointments([]);
      setStats({ total: 0, upcoming: 0, completed: 0, clients: 0 });
      setRecentBookings([]);
      setErrorMsg('Không thể tải dữ liệu lịch hẹn. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await updateAppointmentStatus(appointmentId, newStatus);
      setAppointments(prev => prev.map(apt => apt.id === appointmentId ? { ...apt, status: newStatus } : apt));
      loadAppointments();
    } catch {}
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('vi-VN');
  const formatTime = (dateString) => new Date(dateString).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffa726';
      case 'confirmed': return '#42a5f5';
      case 'completed': return '#66bb6a';
      case 'cancelled': return '#ef5350';
      default: return '#757575';
    }
  };
  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ xác nhận';
      case 'confirmed': return 'Đã xác nhận';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  // Lọc danh sách lịch hẹn theo tab
  let filteredAppointments = recentBookings;
  let listTitle = 'Lịch hẹn gần đây';
  if (activeTab === 'all') {
    filteredAppointments = recentBookings;
    listTitle = 'Lịch hẹn gần đây';
  } else if (activeTab === 'upcoming') {
    filteredAppointments = appointments.filter(a => new Date(a.appointment_time) >= new Date() && a.status === 'confirmed');
    listTitle = 'Lịch sắp tới';
  } else if (activeTab === 'completed') {
    filteredAppointments = appointments.filter(a => a.status === 'completed');
    listTitle = 'Lịch đã hoàn thành';
  } else if (activeTab === 'clients') {
    // Lấy lịch hẹn gần nhất của mỗi khách hàng
    const clientMap = new Map();
    appointments.forEach(a => {
      const key = a.user_id || a.userId || a.user_email;
      if (!clientMap.has(key) || new Date(a.appointment_time) > new Date(clientMap.get(key).appointment_time)) {
        clientMap.set(key, a);
      }
    });
    filteredAppointments = Array.from(clientMap.values());
    listTitle = 'Khách hàng';
  }

  useEffect(() => {
    const fetchPlanInfo = async () => {
      if (selectedAppointment && (selectedAppointment.user_id || selectedAppointment.userId)) {
        try {
          const plans = await getUserPlansBySmokerId(selectedAppointment.user_id || selectedAppointment.userId);
          // Lấy kế hoạch mới nhất
          const plan = Array.isArray(plans) && plans.length > 0 ? plans[0] : null;
          setPlanInfo(plan || {});
        } catch (e) {
          setPlanInfo({});
        }
      } else {
        setPlanInfo({});
      }
    };
    fetchPlanInfo();
  }, [selectedAppointment]);

  if (!user || user.role !== 'coach') {
    return (
      <div className="coach-dashboard-new">
        <div className="access-denied">
          <h2>Không có quyền truy cập</h2>
          <p>Bạn cần đăng nhập với tài khoản coach để truy cập trang này.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="coach-dashboard-new" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh', padding: '32px 0' }}>
      <div className="dashboard-header" style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', padding: 24, margin: '0 auto 24px', maxWidth: 1100 }}>
        <div className="breadcrumb" style={{ color: '#7f8c8d', fontSize: 14, marginBottom: 8 }}>Trang chủ / Dashboard</div>
        <h1 style={{ fontWeight: 700, fontSize: 32, margin: 0 }}>Dashboard Coach</h1>
        <p style={{ color: '#555', margin: 0 }}>Chào mừng, <b>{user.full_name || user.username}</b>!</p>
      </div>
      {errorMsg && (
        <div className="dashboard-error" style={{color: 'red', marginBottom: 12, textAlign: 'center'}}>{errorMsg}</div>
      )}
      {/* Stats Cards */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, maxWidth: 1100, margin: '0 auto 32px' }}>
        <div className="stat-card" onClick={() => setActiveTab('all')} style={{ cursor: 'pointer', boxShadow: activeTab==='all' ? '0 4px 16px rgba(106,130,251,0.15)' : '0 2px 8px rgba(0,0,0,0.06)', border: activeTab==='all' ? '2px solid #6a82fb' : 'none', background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', borderRadius: 16, padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="stat-icon" style={{ fontSize: 32, color: '#6a82fb', background: '#fff', borderRadius: '50%', padding: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}><FaCalendarAlt /></div>
          <div className="stat-info"><h3 style={{ margin: 0, fontSize: 28 }}>{stats.total}</h3><p style={{ margin: 0, color: '#555' }}>Tổng lịch hẹn</p></div>
        </div>
        <div className="stat-card" onClick={() => setActiveTab('upcoming')} style={{ cursor: 'pointer', boxShadow: activeTab==='upcoming' ? '0 4px 16px rgba(66,165,245,0.15)' : '0 2px 8px rgba(0,0,0,0.06)', border: activeTab==='upcoming' ? '2px solid #42a5f5' : 'none', background: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)', borderRadius: 16, padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="stat-icon" style={{ fontSize: 32, color: '#42a5f5', background: '#fff', borderRadius: '50%', padding: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}><FaClock /></div>
          <div className="stat-info"><h3 style={{ margin: 0, fontSize: 28 }}>{stats.upcoming}</h3><p style={{ margin: 0, color: '#555' }}>Lịch sắp tới</p></div>
        </div>
        <div className="stat-card" onClick={() => setActiveTab('completed')} style={{ cursor: 'pointer', boxShadow: activeTab==='completed' ? '0 4px 16px rgba(102,187,106,0.15)' : '0 2px 8px rgba(0,0,0,0.06)', border: activeTab==='completed' ? '2px solid #66bb6a' : 'none', background: 'linear-gradient(135deg, #fceabb 0%, #f8b500 100%)', borderRadius: 16, padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="stat-icon" style={{ fontSize: 32, color: '#66bb6a', background: '#fff', borderRadius: '50%', padding: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}><FaCheckCircle /></div>
          <div className="stat-info"><h3 style={{ margin: 0, fontSize: 28 }}>{stats.completed}</h3><p style={{ margin: 0, color: '#555' }}>Hoàn thành</p></div>
        </div>
        <div className="stat-card" onClick={() => setActiveTab('clients')} style={{ cursor: 'pointer', boxShadow: activeTab==='clients' ? '0 4px 16px rgba(123,67,151,0.15)' : '0 2px 8px rgba(0,0,0,0.06)', border: activeTab==='clients' ? '2px solid #7b4397' : 'none', background: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)', borderRadius: 16, padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="stat-icon" style={{ fontSize: 32, color: '#7b4397', background: '#fff', borderRadius: '50%', padding: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}><FaUsers /></div>
          <div className="stat-info"><h3 style={{ margin: 0, fontSize: 28 }}>{stats.clients}</h3><p style={{ margin: 0, color: '#555' }}>Khách hàng</p></div>
        </div>
      </div>
      {/* Recent Bookings */}
      <div className="appointments-section" style={{ maxWidth: 1100, margin: '0 auto', background: 'white', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', padding: 24 }}>
        <h2 style={{ fontWeight: 600, fontSize: 24, marginBottom: 24, textAlign: 'center' }}>{listTitle}</h2>
        {loading ? (
          <div className="loading"><p>Đang tải...</p></div>
        ) : filteredAppointments.length === 0 ? (
          <div className="no-appointments"><p>Không có dữ liệu.</p></div>
        ) : (
          <div className="appointments-list">
            {filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="appointment-card">
                <div className="appointment-info">
                  <div className="client-info" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FaUsers style={{ color: '#1976d2', fontSize: 18 }} />
                    <span>{appointment.user_name || appointment.userName || 'Unknown User'}</span>
                    <span style={{ color: '#7b7b7b', fontWeight: 400, fontSize: 15, marginLeft: 8 }}>{appointment.user_email || appointment.userEmail}</span>
                  </div>
                  <div className="appointment-details">
                    
                    <span className="appointment-date">
                      <FaCalendarAlt className="calendar-icon" />
                      {new Date(appointment.appointment_time || appointment.date).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                </div>
                <div className="appointment-status">
                  <span className="status-badge" style={{ backgroundColor: getStatusColor(appointment.status) }}>{getStatusText(appointment.status)}</span>
                </div>
                <div className="appointment-actions">
                  {appointment.status === 'pending' && (
                    <>
                      <button className="btn-confirm" onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}>Xác nhận</button>
                      <button className="btn-cancel" onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}>Hủy</button>
                    </>
                  )}
                  {appointment.status === 'confirmed' && (
                    <button className="btn-complete" onClick={() => handleStatusUpdate(appointment.id, 'completed')}>Hoàn thành</button>
                  )}
                  <button className="btn-view" onClick={() => setSelectedAppointment(appointment)}><FaEye /> Chi tiết</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <div className="modal-overlay" onClick={() => setSelectedAppointment(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết lịch hẹn</h3>
              <button className="modal-close" onClick={() => setSelectedAppointment(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-row"><strong>Khách hàng:</strong> {selectedAppointment.user_name || selectedAppointment.userName}</div>
              <div className="detail-row"><strong>Email:</strong> {selectedAppointment.user_email || selectedAppointment.userEmail}</div>
              <div className="detail-row"><strong>Điện thoại:</strong> {selectedAppointment.user_phone || 'Chưa có'}</div>
              <div className="detail-row"><strong>Kế hoạch cai thuốc:</strong> {planInfo.plan_name || planInfo.planName || 'Chưa có'}</div>
              <div className="detail-row"><strong>Số năm hút thuốc:</strong> {planInfo.metadata?.smokingYears || planInfo.smoking_years || planInfo.smokingYears || 'Chưa rõ'}</div>
              <div className="detail-row"><strong>Ngày giờ:</strong> {formatDate(selectedAppointment.appointment_time || selectedAppointment.date)} lúc {formatTime(selectedAppointment.appointment_time || selectedAppointment.date)}</div>
              <div className="detail-row"><strong>Thời gian:</strong> {selectedAppointment.duration_minutes || 120} phút</div>
              <div className="detail-row"><strong>Trạng thái:</strong> <span className="status-badge" style={{ backgroundColor: getStatusColor(selectedAppointment.status), color: '#fff', borderRadius: 8, padding: '4px 12px', fontWeight: 500, fontSize: 14 }}>{getStatusText(selectedAppointment.status)}</span></div>
              {selectedAppointment.notes && (<div className="detail-row"><strong>Ghi chú:</strong> {selectedAppointment.notes}</div>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CoachDashboardNew;

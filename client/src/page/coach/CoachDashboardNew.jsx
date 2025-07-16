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
    pending: 0,
    confirmed: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    if (user && user.role === 'coach') {
      loadAppointments();
    }
  }, [user]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      console.log('📋 Loading coach appointments...');
      
      const response = await getCoachAppointments();
      console.log('📋 Response:', response);
      
      // Handle different response structures
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
      
      // Calculate stats
      const stats = appointmentsData.reduce((acc, apt) => {
        acc.total += 1;
        if (apt.status === 'pending') acc.pending += 1;
        else if (apt.status === 'confirmed') acc.confirmed += 1;
        else if (apt.status === 'completed') acc.completed += 1;
        return acc;
      }, { total: 0, pending: 0, confirmed: 0, completed: 0 });
      
      setStats(stats);
      console.log('📊 Stats:', stats);
      
    } catch (error) {
      console.error('❌ Error loading appointments:', error);
      // Use fallback empty data
      setAppointments([]);
      setStats({ total: 0, pending: 0, confirmed: 0, completed: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      console.log(`🔄 Updating appointment ${appointmentId} to ${newStatus}`);
      
      await updateAppointmentStatus(appointmentId, newStatus);
      
      // Update local state
      setAppointments(prev => prev.map(apt => 
        apt.id === appointmentId ? { ...apt, status: newStatus } : apt
      ));
      
      // Reload to get fresh data
      loadAppointments();
      
      console.log('✅ Status updated successfully');
    } catch (error) {
      console.error('❌ Error updating status:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
    <div className="coach-dashboard-new">
      <div className="dashboard-header">
        <h1>Dashboard Coach</h1>
        <p>Chào mừng, {user.full_name || user.username}!</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FaCalendarAlt />
          </div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Tổng lịch hẹn</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <FaClock />
          </div>
          <div className="stat-info">
            <h3>{stats.pending}</h3>
            <p>Chờ xác nhận</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <FaCheckCircle />
          </div>
          <div className="stat-info">
            <h3>{stats.confirmed}</h3>
            <p>Đã xác nhận</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <FaUsers />
          </div>
          <div className="stat-info">
            <h3>{stats.completed}</h3>
            <p>Hoàn thành</p>
          </div>
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="appointments-section">
        <h2>Lịch hẹn gần đây</h2>
        
        {loading ? (
          <div className="loading">
            <p>Đang tải...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="no-appointments">
            <p>Chưa có lịch hẹn nào</p>
            <small>Khi có người đặt lịch với bạn, nó sẽ hiển thị ở đây</small>
          </div>
        ) : (
          <div className="appointments-list">
            {appointments.slice(0, 10).map((appointment) => (
              <div key={appointment.id} className="appointment-card">
                <div className="appointment-info">
                  <div className="client-info">
                    <h4>{appointment.user_name || 'Unknown User'}</h4>
                    <p>{appointment.user_email}</p>
                  </div>
                  
                  <div className="appointment-details">
                    <p><strong>Ngày:</strong> {formatDate(appointment.appointment_time)}</p>
                    <p><strong>Giờ:</strong> {formatTime(appointment.appointment_time)}</p>
                    <p><strong>Thời lượng:</strong> {appointment.duration_minutes || 120} phút</p>
                    {appointment.notes && (
                      <p><strong>Ghi chú:</strong> {appointment.notes}</p>
                    )}
                  </div>
                  
                  <div className="appointment-status">
                    <span 
                      className="status-badge" 
                      style={{ backgroundColor: getStatusColor(appointment.status) }}
                    >
                      {getStatusText(appointment.status)}
                    </span>
                  </div>
                </div>
                
                <div className="appointment-actions">
                  {appointment.status === 'pending' && (
                    <div className="action-buttons">
                      <button 
                        className="btn-confirm"
                        onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                      >
                        Xác nhận
                      </button>
                      <button 
                        className="btn-cancel"
                        onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                      >
                        Hủy
                      </button>
                    </div>
                  )}
                  
                  {appointment.status === 'confirmed' && (
                    <div className="action-buttons">
                      <button 
                        className="btn-complete"
                        onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                      >
                        Hoàn thành
                      </button>
                    </div>
                  )}
                  
                  <button 
                    className="btn-view"
                    onClick={() => setSelectedAppointment(appointment)}
                  >
                    <FaEye /> Chi tiết
                  </button>
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
              <button 
                className="modal-close"
                onClick={() => setSelectedAppointment(null)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="detail-row">
                <strong>Khách hàng:</strong> {selectedAppointment.user_name}
              </div>
              <div className="detail-row">
                <strong>Email:</strong> {selectedAppointment.user_email}
              </div>
              <div className="detail-row">
                <strong>Điện thoại:</strong> {selectedAppointment.user_phone || 'Chưa có'}
              </div>
              <div className="detail-row">
                <strong>Ngày giờ:</strong> {formatDate(selectedAppointment.appointment_time)} lúc {formatTime(selectedAppointment.appointment_time)}
              </div>
              <div className="detail-row">
                <strong>Thời lượng:</strong> {selectedAppointment.duration_minutes || 120} phút
              </div>
              <div className="detail-row">
                <strong>Trạng thái:</strong> 
                <span 
                  className="status-badge" 
                  style={{ backgroundColor: getStatusColor(selectedAppointment.status) }}
                >
                  {getStatusText(selectedAppointment.status)}
                </span>
              </div>
              {selectedAppointment.notes && (
                <div className="detail-row">
                  <strong>Ghi chú:</strong> {selectedAppointment.notes}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CoachDashboardNew;

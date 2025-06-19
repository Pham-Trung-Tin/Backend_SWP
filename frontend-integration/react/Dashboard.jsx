// React Component cho Dashboard - Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import api from '../api';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.getUserDashboard();
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (err) {
      setError(api.formatError(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="error">Lỗi: {error}</div>;
  }

  if (!dashboardData) {
    return <div className="error">Không có dữ liệu dashboard</div>;
  }

  const { stats, user: userData } = dashboardData;

  return (
    <div className="dashboard">
      <h1>Chào mừng, {userData.name}!</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Ngày không hút thuốc</h3>
          <div className="stat-value">{stats.daysSinceStart}</div>
          <div className="stat-label">ngày</div>
        </div>

        <div className="stat-card">
          <h3>Chuỗi hiện tại</h3>
          <div className="stat-value">{stats.currentStreak}</div>
          <div className="stat-label">ngày liên tiếp</div>
        </div>

        <div className="stat-card">
          <h3>Chuỗi dài nhất</h3>
          <div className="stat-value">{stats.longestStreak}</div>
          <div className="stat-label">ngày</div>
        </div>

        <div className="stat-card">
          <h3>Tiền tiết kiệm</h3>
          <div className="stat-value">{stats.moneySaved.toLocaleString()}</div>
          <div className="stat-label">VNĐ</div>
        </div>

        <div className="stat-card">
          <h3>Điều thuốc không hút</h3>
          <div className="stat-value">{stats.cigarettesNotSmoked}</div>
          <div className="stat-label">điều</div>
        </div>

        <div className="stat-card">
          <h3>Thời gian sống thêm</h3>
          <div className="stat-value">{stats.timeLivedLonger.days}</div>
          <div className="stat-label">ngày ({stats.timeLivedLonger.hours} giờ)</div>
        </div>
      </div>

      <div className="membership-info">
        <h3>Thông tin thành viên</h3>
        <p>Loại: <strong>{dashboardData.membership.type}</strong></p>
        <p>Trạng thái: <strong>{dashboardData.membership.isActive ? 'Đang hoạt động' : 'Không hoạt động'}</strong></p>
        {dashboardData.membership.expiryDate && (
          <p>Hết hạn: {new Date(dashboardData.membership.expiryDate).toLocaleDateString('vi-VN')}</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

import React from 'react';
import { Link } from 'react-router-dom';
import './FeatureSection.css';

export default function FeatureSection() {  return (
    <section className="feature-section">
      <div className="container">
        <h2>Tính năng nổi bật</h2>
        <p className="feature-subtitle">Chúng tôi cung cấp đầy đủ công cụ để hỗ trợ bạn trong hành trình cai thuốc lá thành công</p>
        
        <div className="features-grid">
          <Link to="/progress" className="feature-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <div className="feature-icon blue">
              <i className="fas fa-chart-line"></i>
            </div>
            <h3>Theo dõi tiến trình & thống kê sức khỏe</h3>
            <p>Theo dõi số ngày không hút thuốc, tiền tiết kiệm được và các chỉ số sức khỏe cải thiện theo thời gian thực.</p>
            <span className="feature-link">Xem tiến trình <i className="fas fa-arrow-right"></i></span>
          </Link>
          
          <Link to="/profile#achievements" className="feature-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <div className="feature-icon yellow">
              <i className="fas fa-trophy"></i>
            </div>
            <h3>Hệ thống huy hiệu động viên</h3>
            <p>Nhận huy hiệu thành tích khi đạt được các cột mốc quan trọng trong hành trình cai thuốc lá của bạn.</p>
            <span className="feature-link">Xem huy hiệu <i className="fas fa-arrow-right"></i></span>
          </Link>
          
          <Link to="/journey" className="feature-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <div className="feature-icon green">
              <i className="fas fa-calendar"></i>
            </div>
            <h3>Lập kế hoạch cai thuốc cá nhân hóa</h3>
            <p>Nhận kế hoạch cai thuốc được cá nhân hóa dựa trên thói quen và mục tiêu riêng của bạn.</p>
            <span className="feature-link">Tạo kế hoạch <i className="fas fa-arrow-right"></i></span>
          </Link>
          
          <Link to="/appointment" className="feature-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <div className="feature-icon purple">
              <i className="fas fa-users"></i>
            </div>
            <h3>Kết nối huấn luyện viên hỗ trợ</h3>
            <p>Được kết nối với huấn luyện viên chuyên nghiệp giúp bạn vượt qua những thách thức trong quá trình cai thuốc.</p>
            <span className="feature-link">Đặt lịch ngay <i className="fas fa-arrow-right"></i></span>
          </Link>
          
          <Link to="/blog" className="feature-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <div className="feature-icon red">
              <i className="fas fa-comments"></i>
            </div>
            <h3>Cộng đồng chia sẻ động lực</h3>
            <p>Tham gia cùng đồng những người cùng mục tiêu, chia sẻ kinh nghiệm và động viên mới ngày.</p>
            <span className="feature-link">Tham gia ngay <i className="fas fa-arrow-right"></i></span>
          </Link>
          
          <Link to="/profile#health" className="feature-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <div className="feature-icon teal">
              <i className="fas fa-heartbeat"></i>
            </div>
            <h3>Báo cáo sức khỏe chi tiết</h3>
            <p>Xem báo cáo chi tiết về cải thiện sức khỏe của bạn qua từng giai đoạn cai thuốc lá.</p>
            <span className="feature-link">Xem báo cáo <i className="fas fa-arrow-right"></i></span>
          </Link>
        </div>
      </div>
    </section>
  );
}

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaPhone, 
  FaComments, 
  FaVideo, 
  FaCalendarAlt, 
  FaClock, 
  FaUsers, 
  FaHeart, 
  FaQuestionCircle,
  FaCheckCircle,
  FaExclamationTriangle,
  FaHeadset,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';
import './Support.css';

export default function Support() {
  const [activeTab, setActiveTab] = useState('hotline');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const stats = {
    callsAnswered: '2.5M+',
    successRate: '85%',
    avgResponseTime: '< 30s',
    satisfaction: '4.8/5'
  };

  const contactMethods = [
    {
      id: 'phone',
      icon: FaPhone,
      title: 'Tư vấn qua điện thoại',
      description: 'Gọi trực tiếp để được hỗ trợ ngay lập tức',
      number: '1800-1098',
      hours: '24/7',
      highlight: true
    },
    {
      id: 'chat',
      icon: FaComments,
      title: 'Chat trực tuyến',
      description: 'Trò chuyện với chuyên gia qua tin nhắn',
      availability: '6:00 - 22:00',
      action: 'Bắt đầu chat'
    },
    {
      id: 'video',
      icon: FaVideo,
      title: 'Tư vấn video',
      description: 'Cuộc gọi video 1-1 với chuyên gia',
      availability: '8:00 - 20:00',
      action: 'Đặt lịch video call'
    }
  ];

  const emergencyContacts = [
    {
      title: 'Khẩn cấp về sức khỏe',
      number: '115',
      description: 'Cấp cứu y tế'
    },
    {
      title: 'Hỗ trợ tâm lý khẩn cấp',
      number: '1800-1567',
      description: 'Đường dây nóng tâm lý'
    }
  ];

  const faqs = [
    {
      question: 'Tôi có thể gọi đường dây nóng 1800-1098 bất cứ lúc nào không?',
      answer: 'Có, đường dây nóng 1800-1098 hoạt động 24/7. Chúng tôi luôn sẵn sàng hỗ trợ bạn bất cứ lúc nào trong hành trình cai thuốc.'
    },
    {
      question: 'Cuộc gọi có mất phí không?',
      answer: 'Hoàn toàn miễn phí! Tất cả các cuộc gọi đến 1800-1098 đều không tính phí, bạn có thể yên tâm liên hệ.'
    },
    {
      question: 'Ai sẽ trả lời cuộc gọi của tôi?',
      answer: 'Đội ngũ chuyên gia được đào tạo chuyên sâu về cai thuốc, bao gồm bác sĩ, dược sĩ và tư vấn viên tâm lý có kinh nghiệm.'
    },
    {
      question: 'Thông tin cá nhân của tôi có được bảo mật không?',
      answer: 'Tuyệt đối! Chúng tôi cam kết bảo mật 100% thông tin cá nhân. Mọi cuộc trao đổi đều được mã hóa và tuân thủ nghiêm ngặt các quy định về bảo mật.'
    },
    {
      question: 'Tôi cần chuẩn bị gì trước khi gọi?',
      answer: 'Không cần chuẩn bị gì đặc biệt. Chỉ cần thoải mái chia sẻ tình trạng hiện tại và mong muốn của bạn. Chuyên gia sẽ hướng dẫn chi tiết.'
    },
    {
      question: 'Có thể đặt lịch tư vấn trước không?',
      answer: 'Có! Bạn có thể đặt lịch tư vấn qua trang web hoặc ứng dụng. Điều này giúp đảm bảo bạn được tư vấn đúng thời gian mong muốn.'
    }
  ];

  const successStories = [
    {
      name: 'Anh Minh',
      age: 35,
      smokingYears: 15,
      story: 'Sau 15 năm hút thuốc, tôi đã cai thành công nhờ sự hỗ trợ tận tâm từ đường dây nóng 1800-1098. Các chuyên gia luôn sẵn sàng lắng nghe và đưa ra lời khuyên phù hợp.',
      quitTime: '8 tháng'
    },
    {
      name: 'Chị Lan',
      age: 42,
      smokingYears: 20,
      story: 'Tôi đã thử cai thuốc nhiều lần nhưng không thành công. Nhờ có kế hoạch cá nhân hóa và sự động viên liên tục từ team tư vấn, giờ tôi đã hoàn toàn bỏ được thuốc.',
      quitTime: '1 năm 2 tháng'
    }
  ];

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="support-page">
      {/* Hero Section */}
      <section className="support-hero">
        <div className="container">
          <div className="hero-content">
            <h1>Hỗ Trợ Cai Thuốc 24/7</h1>
            <p>Chúng tôi luôn sẵn sàng đồng hành cùng bạn trong hành trình cai thuốc</p>
            
            <div className="hero-phone">
              <div className="phone-highlight">
                <FaPhone className="phone-icon" />
                <div className="phone-info">
                  <span className="phone-label">Hotline miễn phí</span>
                  <a href="tel:18001098" className="phone-number">1800-1098</a>
                  <span className="phone-hours">24/7 - Hoàn toàn miễn phí</span>
                </div>
              </div>
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">{stats.callsAnswered}</span>
                <span className="stat-label">Cuộc gọi đã hỗ trợ</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.successRate}</span>
                <span className="stat-label">Tỷ lệ thành công</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.avgResponseTime}</span>
                <span className="stat-label">Thời gian phản hồi</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.satisfaction}</span>
                <span className="stat-label">Đánh giá khách hàng</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Methods */}
      <section className="support-methods">
        <div className="container">
          <h2>Các Hình Thức Hỗ Trợ</h2>
          
          <div className="support-tabs">
            <button 
              className={`tab-button ${activeTab === 'hotline' ? 'active' : ''}`}
              onClick={() => setActiveTab('hotline')}
            >
              <FaHeadset /> Hotline 1800-1098
            </button>
            <button 
              className={`tab-button ${activeTab === 'contact' ? 'active' : ''}`}
              onClick={() => setActiveTab('contact')}
            >
              <FaComments /> Liên Hệ Khác
            </button>
            <button 
              className={`tab-button ${activeTab === 'faq' ? 'active' : ''}`}
              onClick={() => setActiveTab('faq')}
            >
              <FaQuestionCircle /> Câu Hỏi Thường Gặp
            </button>
            <button 
              className={`tab-button ${activeTab === 'stories' ? 'active' : ''}`}
              onClick={() => setActiveTab('stories')}
            >
              <FaHeart /> Câu Chuyện Thành Công
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'hotline' && (
              <div className="hotline-content">
                <div className="main-hotline">
                  <div className="hotline-card featured">
                    <div className="hotline-header">
                      <FaPhone className="hotline-icon" />
                      <div className="hotline-info">
                        <h3>Đường Dây Nóng Cai Thuốc</h3>
                        <a href="tel:18001098" className="hotline-number">1800-1098</a>
                      </div>
                      <div className="hotline-status">
                        <span className="status-indicator active"></span>
                        <span>Đang hoạt động</span>
                      </div>
                    </div>
                    
                    <div className="hotline-features">
                      <div className="feature">
                        <FaClock className="feature-icon" />
                        <div>
                          <h4>24/7 Hỗ Trợ</h4>
                          <p>Luôn sẵn sàng mọi lúc, mọi nơi</p>
                        </div>
                      </div>
                      <div className="feature">
                        <FaUsers className="feature-icon" />
                        <div>
                          <h4>Chuyên Gia Giàu Kinh Nghiệm</h4>
                          <p>Đội ngũ bác sĩ, dược sĩ chuyên nghiệp</p>
                        </div>
                      </div>
                      <div className="feature">
                        <FaCheckCircle className="feature-icon" />
                        <div>
                          <h4>Hoàn Toàn Miễn Phí</h4>
                          <p>Không tốn bất kỳ chi phí nào</p>
                        </div>
                      </div>
                    </div>

                    <div className="call-to-action">
                      <a href="tel:18001098" className="call-btn primary">
                        <FaPhone /> Gọi Ngay 1800-1098
                      </a>
                      <Link to="/appointment" className="call-btn secondary">
                        <FaCalendarAlt /> Đặt Lịch Tư Vấn
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Emergency Contacts */}
                <div className="emergency-contacts">
                  <h3>
                    <FaExclamationTriangle className="warning-icon" />
                    Số Điện Thoại Khẩn Cấp
                  </h3>
                  <div className="emergency-grid">
                    {emergencyContacts.map((contact, index) => (
                      <div key={index} className="emergency-card">
                        <h4>{contact.title}</h4>
                        <a href={`tel:${contact.number}`} className="emergency-number">{contact.number}</a>
                        <p>{contact.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="contact-methods">
                <div className="methods-grid">
                  {contactMethods.map((method) => (
                    <div key={method.id} className={`method-card ${method.highlight ? 'highlight' : ''}`}>
                      <method.icon className="method-icon" />
                      <h3>{method.title}</h3>
                      <p>{method.description}</p>
                      
                      {method.number && (
                        <div className="method-contact">
                          <a href={`tel:${method.number}`} className="contact-number">{method.number}</a>
                          <span className="contact-hours">{method.hours}</span>
                        </div>
                      )}
                      
                      {method.availability && (
                        <div className="method-availability">
                          <span>Hoạt động: {method.availability}</span>
                        </div>
                      )}
                      
                      {method.action && (
                        <button className="method-action">{method.action}</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="faq-section">
                <div className="faq-list">
                  {faqs.map((faq, index) => (
                    <div key={index} className="faq-item">
                      <button 
                        className="faq-question"
                        onClick={() => toggleFaq(index)}
                      >
                        <span>{faq.question}</span>
                        {expandedFaq === index ? <FaChevronUp /> : <FaChevronDown />}
                      </button>
                      {expandedFaq === index && (
                        <div className="faq-answer">
                          <p>{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="faq-contact">
                  <h3>Không tìm thấy câu trả lời?</h3>
                  <p>Hãy gọi trực tiếp để được hỗ trợ chi tiết</p>
                  <a href="tel:18001098" className="faq-call-btn">
                    <FaPhone /> Gọi 1800-1098
                  </a>
                </div>
              </div>
            )}

            {activeTab === 'stories' && (
              <div className="success-stories">
                <div className="stories-grid">
                  {successStories.map((story, index) => (
                    <div key={index} className="story-card">
                      <div className="story-header">
                        <div className="story-avatar">
                          {story.name.charAt(0)}
                        </div>
                        <div className="story-info">
                          <h3>{story.name}</h3>
                          <div className="story-details">
                            <span>{story.age} tuổi</span>
                            <span>•</span>
                            <span>Hút thuốc {story.smokingYears} năm</span>
                            <span>•</span>
                            <span className="quit-time">Đã cai được {story.quitTime}</span>
                          </div>
                        </div>
                      </div>
                      <div className="story-content">
                        <p>"{story.story}"</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="stories-cta">
                  <h3>Bạn cũng có thể thành công như họ!</h3>
                  <p>Hãy bắt đầu hành trình cai thuốc của bạn ngay hôm nay</p>
                  <a href="tel:18001098" className="stories-call-btn">
                    <FaPhone /> Gọi 1800-1098 để bắt đầu
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bottom-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Sẵn Sàng Bắt Đầu Hành Trình Cai Thuốc?</h2>
            <p>Đừng để thuốc lá tiếp tục ảnh hưởng đến sức khỏe và cuộc sống của bạn</p>
            
            <div className="cta-actions">
              <a href="tel:18001098" className="cta-btn primary">
                <FaPhone /> Gọi Ngay 1800-1098
              </a>
              <Link to="/journey" className="cta-btn secondary">
                <FaCalendarAlt /> Tạo Kế Hoạch Cai Thuốc
              </Link>
            </div>
            
            <div className="cta-note">
              <p>
                <FaCheckCircle className="check-icon" />
                Cuộc gọi hoàn toàn miễn phí và bảo mật
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
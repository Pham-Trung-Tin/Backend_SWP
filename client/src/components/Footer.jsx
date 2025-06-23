import { FaFacebookF, FaLinkedinIn, FaTwitter, FaYoutube, FaInstagram } from "react-icons/fa";
import { IoChevronUpOutline } from "react-icons/io5";
import './footer.css';
import { Link } from 'react-router-dom';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="nosmoke-footer">
      <button className="back-to-top" onClick={scrollToTop}>
        Về đầu trang <IoChevronUpOutline />
      </button>
      <div className="container">
        <div className="footer-top">
          <div className="footer-col">
            <h4>Bỏ thuốc lá</h4>
            <ul>
              <li><Link to="/resources">Tài nguyên hỗ trợ</Link></li>
              <li><Link to="/tips">Mẹo vượt qua cơn nghiện</Link></li>
              <li><Link to="/health">Lợi ích sức khỏe</Link></li>
              <li><Link to="/faq">Câu hỏi thường gặp</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Về NoSmoke</h4>
            <ul>
              <li><Link to="/about">Câu chuyện của chúng tôi</Link></li>
              <li><Link to="/team">Đội ngũ</Link></li>
              <li><Link to="/partners">Đối tác</Link></li>
              <li><Link to="/testimonials">Phản hồi người dùng</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Hỗ trợ</h4>
            <ul>
              <li><Link to="/support">Tư vấn trực tiếp</Link></li>
              <li><Link to="/community">Cộng đồng hỗ trợ</Link></li>
              <li><Link to="/contact">Liên hệ</Link></li>
              <li><Link to="/feedback">Góp ý</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Kết nối</h4>
            <div className="social-links">
              <a href="#" className="social-icon"><FaFacebookF /></a>
              <a href="#" className="social-icon"><FaTwitter /></a>
              <a href="#" className="social-icon"><FaInstagram /></a>
              <a href="#" className="social-icon"><FaYoutube /></a>
              <a href="#" className="social-icon"><FaLinkedinIn /></a>
            </div>
            <div className="newsletter">
              <h4>Nhận thông tin mới nhất</h4>
              <form>
                <input type="email" placeholder="Email của bạn" required />
                <button type="submit">Đăng ký</button>
              </form>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} NoSmoke. Tất cả quyền được bảo lưu.</p>
          <div className="footer-links">
            <Link to="/privacy">Chính sách bảo mật</Link>
            <Link to="/terms">Điều khoản sử dụng</Link>
            <Link to="/sitemap">Sơ đồ trang</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

import React, { useState, useEffect } from 'react';
import { FaArrowUp } from 'react-icons/fa';
import '../styles/BackToTop.css';

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(true); // Mặc định hiển thị

  // Xử lý sự kiện cuộn lên đầu trang
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Chỉ ẩn nút khi ở đầu trang
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY === 0) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    // Gọi ngay để đặt trạng thái ban đầu
    toggleVisibility();

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);
  // Luôn render nút, chỉ ẩn bằng CSS khi không isVisible
  return (
    <button
      onClick={scrollToTop}
      className={`back-to-top ${isVisible ? 'visible' : ''}`}
      aria-label="Quay lại đầu trang"
    >
      <FaArrowUp className="back-to-top-icon" />
    </button>
  );
}

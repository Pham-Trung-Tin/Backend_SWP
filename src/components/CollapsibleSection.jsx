import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import '../styles/CollapsibleSection.css';

/**
 * Component hiển thị phần nội dung có thể thu gọn/mở rộng khi click
 * @param {Object} props - Component props
 * @param {string} props.title - Tiêu đề của phần
 * @param {node} props.children - Nội dung của phần
 * @param {string} props.icon - Icon hiển thị bên cạnh tiêu đề (component React)
 * @param {boolean} props.defaultOpen - Trạng thái mặc định (mở hoặc đóng)
 * @param {string} props.className - CSS class bổ sung
 */
const CollapsibleSection = ({ 
  title, 
  children, 
  icon, 
  defaultOpen = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`collapsible-section ${className}`}>
      <div 
        className={`collapsible-header ${isOpen ? 'active' : ''}`}
        onClick={toggleOpen}
      >
        <div className="header-content">
          {icon && <span className="header-icon">{icon}</span>}
          <h2>{title}</h2>
        </div>
        <span className="toggle-icon">
          {isOpen ? <FaChevronUp /> : <FaChevronDown />}
        </span>
      </div>
      
      <div className={`collapsible-content ${isOpen ? 'open' : ''}`}>
        <div className="content-inner">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CollapsibleSection;

import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaArrowLeft, FaArrowRight, FaCheck } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RequireMembership from '../components/RequireMembership';
import './BookAppointment.css';

function BookAppointment() {
  const [step, setStep] = useState(1); // 1: Choose coach, 2: Select date, 3: Select time
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showSuccess, setShowSuccess] = useState(false);
  const [appointmentId, setAppointmentId] = useState(null);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [originalAppointment, setOriginalAppointment] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're rescheduling an appointment
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const isRescheduling = searchParams.get('reschedule') === 'true';

    if (isRescheduling) {
      // Get the appointment to reschedule from localStorage
      const appointmentToReschedule = JSON.parse(localStorage.getItem('appointmentToReschedule'));

      if (appointmentToReschedule) {
        setIsRescheduling(true);
        setOriginalAppointment(appointmentToReschedule);
        setAppointmentId(appointmentToReschedule.id);

        // Find and preselect the coach
        const coach = coaches.find(c => c.id === appointmentToReschedule.coachId);
        if (coach) {
          setSelectedCoach(coach);
          setStep(2); // Move to date selection step

          // Set the current month to the appointment date month
          const appointmentDate = new Date(appointmentToReschedule.date);
          setCurrentMonth(new Date(
            appointmentDate.getFullYear(),
            appointmentDate.getMonth(),
            1
          ));

          // Preselect the date
          setSelectedDate(appointmentDate);
        }
      }
    }
  }, [location]);

  // Mock data for coaches
  const coaches = [
    {
      id: 1,
      name: 'Nguyên Văn A',
      role: 'Coach cai thuốc chuyên nghiệp',
      rating: 4.8,
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      available: true
    },
    {
      id: 2,
      name: 'Trần Thị B',
      role: 'Chuyên gia tâm lý',
      rating: 4.9,
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      available: true
    },
    {
      id: 3,
      name: 'Phạm Minh C',
      role: 'Bác sĩ phục hồi chức năng',
      rating: 4.7,
      avatar: 'https://randomuser.me/api/portraits/men/64.jpg',
      available: true
    }
  ];

  // Available time slots
  const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

  // Helper functions for calendar
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);

    const days = [];

    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const goToPrevMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  const formatMonth = (date) => {
    const options = { month: 'long', year: 'numeric' };
    return date.toLocaleDateString('vi-VN', options);
  };

  const handleSelectCoach = (coach) => {
    setSelectedCoach(coach);
    setStep(2);
  };

  const handleSelectDate = (day) => {
    if (!day) return;

    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(selectedDate);
    setStep(3);
  };

  const handleSelectTime = (time) => {
    setSelectedTime(time);

    // Sử dụng ID của lịch hẹn cũ nếu đang thay đổi lịch hẹn, ngược lại tạo ID mới
    const newAppointmentId = isRescheduling ? originalAppointment.id : Math.floor(Math.random() * 1000000);
    setAppointmentId(newAppointmentId);

    // Tạo đối tượng lịch hẹn mới
    const appointment = {
      id: newAppointmentId,
      coachId: selectedCoach.id,
      coachName: selectedCoach.name,
      coachAvatar: selectedCoach.avatar,
      coachRole: selectedCoach.role,
      date: selectedDate.toISOString(),
      time: time,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    // Lưu vào localStorage
    const existingAppointments = JSON.parse(localStorage.getItem('appointments')) || [];

    if (isRescheduling) {
      // Nếu đang thay đổi lịch hẹn, xóa lịch hẹn cũ và thêm lịch hẹn mới
      const updatedAppointments = existingAppointments.filter(app => app.id !== originalAppointment.id);
      updatedAppointments.push(appointment);
      localStorage.setItem('appointments', JSON.stringify(updatedAppointments));

      // Xóa thông tin lịch hẹn đang thay đổi từ localStorage
      localStorage.removeItem('appointmentToReschedule');
    } else {
      // Nếu đang đặt lịch hẹn mới, thêm vào danh sách
      const updatedAppointments = [...existingAppointments, appointment];
      localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
    }

    // Hiển thị thông báo thành công
    setShowSuccess(true);

    // Lưu trạng thái tab trong localStorage để Profile page hiển thị tab lịch hẹn
    localStorage.setItem('activeProfileTab', 'appointments');
    // Sau 3 giây chuyển hướng đến trang home
    setTimeout(() => {
      navigate('/');
    }, 3000);
  };

  const renderCoachSelection = () => {
    return (
      <div className="coach-selection-container">
        <h2>Chọn Coach</h2>
        <div className="coaches-list">
          {coaches.map(coach => (
            <div
              key={coach.id}
              className={`coach-card ${selectedCoach?.id === coach.id ? 'selected' : ''}`}
              onClick={() => handleSelectCoach(coach)}
            >
              <div className="coach-avatar">
                <img src={coach.avatar} alt={coach.name} />
                {coach.available && <div className="coach-status available"></div>}
              </div>
              <div className="coach-info">
                <h3>{coach.name}</h3>
                <p>{coach.role}</p>
                <div className="coach-rating">
                  <span className="stars">{'★'.repeat(Math.floor(coach.rating))}{coach.rating % 1 > 0 ? '☆' : ''}</span>
                  <span className="rating-value">{coach.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDateSelection = () => {
    const days = generateCalendarDays();
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    return (
      <div className="date-selection-container">
        <div className="selection-header">
          <button onClick={() => setStep(1)} className="back-button">
            <FaArrowLeft /> Quay lại
          </button>
          <h2>Chọn ngày & giờ</h2>
        </div>

        <div className="selected-coach">
          <img src={selectedCoach.avatar} alt={selectedCoach.name} className="small-avatar" />
          <span>{selectedCoach.name}</span>
        </div>

        <div className="calendar-container">
          <div className="calendar-header">
            <button onClick={goToPrevMonth} className="month-nav">
              <FaArrowLeft />
            </button>
            <h3>{formatMonth(currentMonth)}</h3>
            <button onClick={goToNextMonth} className="month-nav">
              <FaArrowRight />
            </button>
          </div>

          <div className="calendar">
            {dayNames.map(day => (
              <div key={day} className="day-header">{day}</div>
            ))}

            {days.map((day, index) => (
              <div
                key={index}
                className={`calendar-day ${!day ? 'empty' : ''} ${day === new Date().getDate() && currentMonth.getMonth() === new Date().getMonth() && currentMonth.getFullYear() === new Date().getFullYear() ? 'today' : ''}`}
                onClick={() => handleSelectDate(day)}
              >
                {day}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderTimeSelection = () => {
    return (
      <div className="time-selection-container">
        <div className="selection-header">
          <button onClick={() => setStep(2)} className="back-button">
            <FaArrowLeft /> Quay lại
          </button>
          <h2>Chọn thời gian</h2>
        </div>

        <div className="selection-details">
          <div className="selected-coach">
            <img src={selectedCoach.avatar} alt={selectedCoach.name} className="small-avatar" />
            <span>{selectedCoach.name}</span>
          </div>
          <div className="selected-date">
            <FaCalendarAlt />
            <span>{selectedDate.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>

        <div className="time-slots-container">
          <p>Khung giờ còn trống:</p>
          <div className="time-slots">
            {timeSlots.map(time => (
              <button
                key={time}
                className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                onClick={() => handleSelectTime(time)}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Rendu de la confirmation du rendez-vous
  const renderSuccess = () => {
    return (
      <div className="appointment-success">
        <div className="success-icon">
          <FaCheck />
        </div>
        <h2>{isRescheduling ? 'Thay đổi lịch thành công!' : 'Đặt lịch thành công!'}</h2>
        <p>Bạn đã {isRescheduling ? 'thay đổi lịch hẹn' : 'đặt lịch hẹn'} với <strong>{selectedCoach.name}</strong></p>
        <p>Vào ngày <strong>{selectedDate.toLocaleDateString('vi-VN')}</strong> lúc <strong>{selectedTime}</strong></p>
        <p>Mã cuộc hẹn: <strong>#{appointmentId}</strong></p>
        <p className="redirect-message">Bạn sẽ được chuyển đến trang hồ sơ cá nhân để xem lịch hẹn của bạn...</p>
      </div>
    );
  };
  return (
    <section className="appointment-section">
      <div className="container">        <div className="appointment-header">
        <h1>
          <FaCalendarAlt className="appointment-icon" />
          <span>Đặt lịch hẹn với Coach</span>
        </h1>
      </div>

        {showSuccess ? renderSuccess() : (
          <RequireMembership allowedMemberships={['premium', 'pro']} showModal={true}>
            <div className="appointment-stepper">
              <div
                className={`stepper-step ${step >= 1 ? 'active' : ''} ${selectedCoach ? 'clickable' : ''}`}
                onClick={() => selectedCoach && setStep(1)}
              >
                <div className="step-number">1</div>
                <div className="step-label">Chọn Coach</div>
              </div>
              <div className="stepper-line"></div>
              <div
                className={`stepper-step ${step >= 2 ? 'active' : ''} ${selectedDate ? 'clickable' : ''}`}
                onClick={() => selectedDate && setStep(2)}
              >
                <div className="step-number">2</div>
                <div className="step-label">Chọn ngày</div>
              </div>
              <div className="stepper-line"></div>
              <div
                className={`stepper-step ${step >= 3 ? 'active' : ''} ${selectedTime ? 'clickable' : ''}`}
                onClick={() => selectedTime && setStep(3)}
              >
                <div className="step-number">3</div>
                <div className="step-label">Chọn giờ</div>
              </div>
            </div>

            <div className="appointment-content">
              {step === 1 && renderCoachSelection()}
              {step === 2 && renderDateSelection()}
              {step === 3 && renderTimeSelection()}            </div>
          </RequireMembership>
        )}
      </div>
    </section>
  );
}

// Export the component wrapped with membership requirement
export default BookAppointment;

import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaArrowLeft, FaArrowRight, FaCheck, FaClock } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RequireMembership from '../components/RequireMembership';
import './BookAppointment.css';
import { createAppointment, updateAppointment, deleteAppointment } from '../utils/userAppointmentApi';
import { getCoachAvailability } from '../services/coachService';
import api from '../utils/api';

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
  const [coaches, setCoaches] = useState([]);
  const [loadingCoaches, setLoadingCoaches] = useState(true);
  const [coachAvailability, setCoachAvailability] = useState([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
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

  // Load coaches from API
  useEffect(() => {
    const fetchCoaches = async () => {
      setLoadingCoaches(true);
      try {
        console.log('👥 Fetching coaches from API...');
        
        // Coaches endpoint is public, no auth needed
        const response = await api.fetch('/api/coaches');
        
        console.log('👥 Coaches API response:', response);
        
        if (response.success && response.data) {
          console.log(`✅ Loaded ${response.data.length} coaches`);
          setCoaches(response.data);
        } else {
          console.error('❌ Failed to load coaches:', response.message);
          // Fallback to empty array
          setCoaches([]);
        }
      } catch (error) {
        console.error('❌ Error fetching coaches:', error);
        // Fallback to empty array
        setCoaches([]);
      } finally {
        setLoadingCoaches(false);
      }
    };

    fetchCoaches();
  }, []);

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

  const handleSelectDate = async (day) => {
    if (!day) return;

    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(selectedDate);
    
    // Fetch coach availability for selected date
    await fetchCoachAvailability(selectedCoach.id, selectedDate);
    
    setStep(3);
  };

  // Function to fetch coach availability for a specific date
  const fetchCoachAvailability = async (coachId, date) => {
    setLoadingAvailability(true);
    try {
      console.log('🔍 Fetching availability for coach:', coachId, 'date:', date);
      const availabilityData = await getCoachAvailability(coachId);
      
      console.log('📋 Raw availability data:', availabilityData);
      
      // Extract available_slots from the response
      const availableSlots = availabilityData?.available_slots || [];
      
      // Filter availability for the selected date
      const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayOfWeek];
      
      // Filter availability for selected day
      const dayAvailability = availableSlots.filter(slot => 
        slot.day_of_week?.toLowerCase() === dayName.toLowerCase() ||
        slot.dayOfWeek?.toLowerCase() === dayName.toLowerCase()
      );
      
      console.log('📅 Availability for', dayName, ':', dayAvailability);
      
      // Structure để lưu vào state - luôn bao gồm booked_appointments
      const structuredAvailability = {
        available_slots: dayAvailability,
        booked_appointments: availabilityData.booked_appointments || [],
        working_hours: availabilityData.working_hours || '08:00-22:00'
      };
      
      // If no specific day availability found, create default slots from working hours
      if (dayAvailability.length === 0 && availabilityData?.working_hours) {
        console.log('🔄 No specific availability found, using working hours:', availabilityData.working_hours);
        const workingHours = availabilityData.working_hours;
        if (workingHours.includes('-')) {
          const [startTime, endTime] = workingHours.split('-');
          const defaultSlot = {
            day_of_week: dayName,
            time_start: startTime,
            time_end: endTime,
            start_time: startTime,
            end_time: endTime
          };
          console.log('🔧 Created default slot from working hours:', defaultSlot);
          structuredAvailability.available_slots = [defaultSlot];
        }
      }
      
      console.log('🎯 Final structured availability:', structuredAvailability);
      setCoachAvailability(structuredAvailability);
      
    } catch (error) {
      console.error('❌ Error fetching coach availability:', error);
      setCoachAvailability({
        available_slots: [],
        booked_appointments: [],
        working_hours: '08:00-22:00'
      });
    } finally {
      setLoadingAvailability(false);
    }
  };
  const handleSelectTime = async (time) => {
    setSelectedTime(time);
    
    try {
      console.log('📅 Starting appointment creation process...');
      
      // Debug: Check authentication before creating appointment
      const token = localStorage.getItem('nosmoke_token') || 
                    sessionStorage.getItem('nosmoke_token') ||
                    localStorage.getItem('token');
      
      if (!token) {
        console.error('❌ No authentication token found. User needs to login.');
        alert('Bạn cần đăng nhập để đặt lịch hẹn. Vui lòng đăng nhập lại.');
        navigate('/login');
        return;
      }
      
      console.log('🔑 Found token for appointment:', token.substring(0, 20) + '...');
      console.log('👤 Current user:', user);
      
      // Chuẩn bị dữ liệu appointment
      const appointmentDateTime = new Date(selectedDate);
      const [hours, minutes] = time.split(':');
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      const appointmentData = {
        coach_id: selectedCoach.id,
        appointment_time: appointmentDateTime.toISOString(),
        duration_minutes: 60, // Default 60 minutes
        notes: `Cuộc hẹn với ${selectedCoach.full_name || selectedCoach.username}`
      };

      console.log('📋 Appointment data:', appointmentData);

      if (isRescheduling && originalAppointment) {
        console.log('🔄 Updating existing appointment...');
        // Nếu đang thay đổi lịch hẹn, cập nhật lịch hẹn cũ
        await updateAppointment(originalAppointment.id, appointmentData);
        setAppointmentId(originalAppointment.id);
        
        // Xóa thông tin lịch hẹn đang thay đổi từ localStorage
        localStorage.removeItem('appointmentToReschedule');
      } else {
        console.log('➕ Creating new appointment...');
        // Nếu đang đặt lịch hẹn mới
        const response = await createAppointment(appointmentData);
        console.log('✅ Appointment created successfully:', response);
        setAppointmentId(response.data.id);
      }

      // Hiển thị thông báo thành công
      setShowSuccess(true);

      // Lưu trạng thái tab trong localStorage để Profile page hiển thị tab lịch hẹn
      localStorage.setItem('activeProfileTab', 'appointments');

      // Sau 3 giây chuyển hướng đến trang hồ sơ
      setTimeout(() => {
        navigate('/profile');
      }, 3000);
      
    } catch (error) {
      console.error('❌ Error creating/updating appointment:', error);
      
      // More specific error handling
      if (error.message.includes('Not authenticated')) {
        alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        navigate('/login');
      } else if (error.message.includes('No auth token')) {
        alert('Không tìm thấy thông tin xác thực. Vui lòng đăng nhập lại.');
        navigate('/login');
      } else {
        alert('Có lỗi xảy ra khi đặt lịch hẹn. Vui lòng thử lại.');
      }
    }
  };

  const renderCoachSelection = () => {
    if (loadingCoaches) {
      return (
        <div className="coach-selection-container">
          <h2>Chọn Coach</h2>
          <div className="loading-coaches">
            <div className="loading-spinner"></div>
            <p>Đang tải danh sách coach...</p>
          </div>
        </div>
      );
    }

    if (coaches.length === 0) {
      return (
        <div className="coach-selection-container">
          <h2>Chọn Coach</h2>
          <div className="no-coaches">
            <p>Hiện tại không có coach nào khả dụng. Vui lòng thử lại sau.</p>
          </div>
        </div>
      );
    }

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
                <img 
                  src={coach.avatar_url || coach.avatar || '/image/default-user-avatar.svg'} 
                  alt={coach.full_name || coach.username || 'Coach'} 
                  onError={(e) => {
                    e.target.src = '/image/default-user-avatar.svg';
                  }}
                />
                <div className="coach-status available"></div>
              </div>
              <div className="coach-info">
                <h3>{coach.full_name || coach.username || 'Tên coach'}</h3>
                <p>{coach.specialization || coach.bio || 'Coach tư vấn cai thuốc'}</p>
                <div className="coach-rating">
                  <span className="stars">{'★'.repeat(Math.floor(parseFloat(coach.avg_rating || 5)))}{parseFloat(coach.avg_rating || 5) % 1 > 0 ? '☆' : ''}</span>
                  <span className="rating-value">{parseFloat(coach.avg_rating || 5).toFixed(1)}</span>
                  {coach.review_count && <span className="review-count">({coach.review_count} đánh giá)</span>}
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
          <h2>Chọn ngày & giờ</h2>
        </div>

        <div className="selected-coach">
          <img 
            src={selectedCoach.avatar_url || selectedCoach.avatar || '/image/default-user-avatar.svg'} 
            alt={selectedCoach.full_name || selectedCoach.username || 'Coach'} 
            className="small-avatar" 
            onError={(e) => {
              e.target.src = '/image/default-user-avatar.svg';
            }}
          />
          <span>{selectedCoach.full_name || selectedCoach.username || 'Coach'}</span>
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
        
        <button onClick={() => setStep(1)} className="back-button">
          <FaArrowLeft /> Quay lại
        </button>
      </div>
    );
  };
  const renderTimeSelection = () => {
    // Helper function to generate time slots from availability
    const generateTimeSlots = (availability) => {
      const slots = [];
      
      availability.forEach(slot => {
        const startTime = slot.start_time || slot.time_start;
        const endTime = slot.end_time || slot.time_end;
        
        if (!startTime || !endTime) return;
        
        // Parse start and end times
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);
        
        // Generate 2-hour slots between start and end time
        let currentHour = startHour;
        let currentMin = startMin;
        
        while (currentHour < endHour) {
          const timeString = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
          
          // Calculate end time for this 2-hour slot
          let slotEndHour = currentHour + 2;
          let slotEndMin = currentMin;
          
          // Make sure we don't go past the availability end time
          if (slotEndHour > endHour || (slotEndHour === endHour && slotEndMin > endMin)) {
            slotEndHour = endHour;
            slotEndMin = endMin;
          }
          
          const slotEndTime = `${String(slotEndHour).padStart(2, '0')}:${String(slotEndMin).padStart(2, '0')}`;
          
          slots.push({
            time: timeString,
            displayTime: `${timeString} - ${slotEndTime}`,
            available: true
          });
          
          // Move to next slot (advance by 2 hours)
          currentHour += 2;
          
          // If we've reached or passed the end time, break
          if (currentHour >= endHour) {
            break;
          }
        }
      });
      
      return slots;
    };

    // Helper function to check if a time slot is booked
    const isSlotBooked = (slotTime, bookedAppointments) => {
      if (!bookedAppointments || bookedAppointments.length === 0) return false;
      
      const selectedDateStr = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      return bookedAppointments.some(appointment => {
        // Check if appointment is on the same date
        const appointmentDate = appointment.date || appointment.appointment_date;
        if (appointmentDate !== selectedDateStr) return false;
        
        // Check if appointment time conflicts with slot time
        const appointmentTime = appointment.time || appointment.appointment_time;
        if (!appointmentTime) return false;
        
        // Parse appointment time (could be HH:MM or full datetime)
        let appointmentHour, appointmentMin;
        if (appointmentTime.includes(':')) {
          [appointmentHour, appointmentMin] = appointmentTime.split(':').map(Number);
        } else {
          // If it's a full datetime, extract time part
          const timeMatch = appointmentTime.match(/(\d{2}):(\d{2})/);
          if (timeMatch) {
            appointmentHour = parseInt(timeMatch[1]);
            appointmentMin = parseInt(timeMatch[2]);
          } else {
            return false;
          }
        }
        
        // Parse slot time
        const [slotHour, slotMin] = slotTime.split(':').map(Number);
        
        // Check if appointment time falls within this 2-hour slot
        const appointmentMinutes = appointmentHour * 60 + appointmentMin;
        const slotStartMinutes = slotHour * 60 + slotMin;
        const slotEndMinutes = slotStartMinutes + 120; // 2 hours = 120 minutes
        
        return appointmentMinutes >= slotStartMinutes && appointmentMinutes < slotEndMinutes;
      });
    };

    // Get availability data from state
    const availabilityData = coachAvailability;
    console.log('🎯 Coach availability data for time slots:', availabilityData);
    
    // Extract slots and booked appointments from the structure
    let availabilitySlots = [];
    let bookedAppointments = [];
    
    if (availabilityData && typeof availabilityData === 'object') {
      // If it's a structured object with available_slots and booked_appointments
      if (availabilityData.available_slots) {
        availabilitySlots = availabilityData.available_slots;
        bookedAppointments = availabilityData.booked_appointments || [];
      }
      // If it's an array (backward compatibility)
      else if (Array.isArray(availabilityData)) {
        availabilitySlots = availabilityData;
        bookedAppointments = availabilityData[0]?.booked_appointments || [];
      }
    }
    
    console.log('📋 Availability slots:', availabilitySlots);
    console.log('📅 Booked appointments:', bookedAppointments);
    
    // Generate all possible time slots
    const allTimeSlots = generateTimeSlots(availabilitySlots);
    
    // Filter out booked slots
    const availableTimeSlots = allTimeSlots.filter(slot => {
      const isBooked = isSlotBooked(slot.time, bookedAppointments);
      console.log(`⏰ Slot ${slot.displayTime}: ${isBooked ? 'BOOKED ❌' : 'AVAILABLE ✅'}`);
      return !isBooked;
    });
    
    console.log('📊 Slot Summary:');
    console.log(`- Total possible slots: ${allTimeSlots.length}`);
    console.log(`- Available slots: ${availableTimeSlots.length}`);
    console.log(`- Blocked slots: ${allTimeSlots.length - availableTimeSlots.length}`);
    console.log('✅ Available time slots after filtering:', availableTimeSlots.map(s => s.displayTime));
    
    // For debugging - log blocked slots
    const blockedSlots = allTimeSlots.filter(slot => isSlotBooked(slot.time, bookedAppointments));
    if (blockedSlots.length > 0) {
      console.log('🚫 Blocked slots:', blockedSlots.map(s => s.displayTime));
    }
    
    return (
      <div className="time-selection-container">
        <div className="selection-header">
          <h2>Chọn thời gian</h2>
        </div>

        <div className="selection-details">
          <div className="selected-coach">
            <img 
              src={selectedCoach.avatar_url || selectedCoach.avatar || '/image/default-user-avatar.svg'} 
              alt={selectedCoach.full_name || selectedCoach.username || 'Coach'} 
              className="small-avatar" 
              onError={(e) => {
                e.target.src = '/image/default-user-avatar.svg';
              }}
            />
            <span>{selectedCoach.full_name || selectedCoach.username || 'Coach'}</span>
          </div>
          <div className="selected-date">
            <FaCalendarAlt />
            <span>{selectedDate.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>

        <div className="time-slots-container">
          {loadingAvailability ? (
            <div className="loading-availability">
              <FaClock className="loading-icon" />
              <p>Đang tải lịch trống của coach...</p>
            </div>
          ) : availableTimeSlots.length > 0 ? (
            <>
              <p className="slots-instruction">Chọn khung giờ còn trống:</p>
              <div className="time-slots-grid">
                {availableTimeSlots.map((slot, index) => (
                  <button
                    key={index}
                    className={`time-slot ${selectedTime === slot.time ? 'selected' : ''} ${!slot.available ? 'disabled' : ''}`}
                    onClick={() => slot.available && handleSelectTime(slot.time)}
                    disabled={!slot.available}
                  >
                    <FaClock className="time-icon" />
                    {slot.displayTime}
                  </button>
                ))}
              </div>
              {allTimeSlots.length > availableTimeSlots.length && (
                <div className="booked-info">
                  <p>💡 {allTimeSlots.length - availableTimeSlots.length} khung giờ đã có người đặt</p>
                  <small>Chỉ hiển thị các khung giờ còn trống để đặt lịch</small>
                </div>
              )}
            </>
          ) : (
            <div className="no-availability">
              <FaClock className="no-slots-icon" />
              <p>Tất cả khung giờ trong ngày này đã được đặt</p>
              <p className="suggestion">Vui lòng chọn ngày khác</p>
            </div>
          )}
        </div>
        
        <button onClick={() => setStep(2)} className="back-button">
          <FaArrowLeft /> Quay lại
        </button>
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
        <h2>{isRescheduling ? 'Thay đổi lịch thành công!' : 'Đặt lịch thành công!'}</h2>        <p>Bạn đã {isRescheduling ? 'thay đổi lịch hẹn' : 'đặt lịch hẹn'} với <strong>{selectedCoach.full_name || selectedCoach.username}</strong></p>
        <p>Vào ngày <strong>{selectedDate.toLocaleDateString('vi-VN')}</strong> lúc <strong>{selectedTime}</strong></p>
        <p>Mã cuộc hẹn: <strong>#{appointmentId}</strong></p>
        <div className="pending-status-info">
          <p><strong>⏳ Trạng thái:</strong> Đang chờ coach xác nhận</p>
          <p className="status-note">Coach sẽ xem xét và xác nhận lịch hẹn của bạn. Bạn sẽ nhận được thông báo khi lịch được xác nhận.</p>
        </div>
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

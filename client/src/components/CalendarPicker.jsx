import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaArrowLeft, FaArrowRight, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import './CalendarPicker.css';

const CalendarPicker = ({ onDateSelect, currentPlan, actualProgress = [] }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [checkInDates, setCheckInDates] = useState(new Set());

    // Load check-in dates from localStorage
    useEffect(() => {
        const checkinDates = new Set();
        const today = new Date();

        // Check last 90 days for check-in data
        for (let i = 0; i < 90; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const checkinData = localStorage.getItem(`checkin_${dateStr}`);
            if (checkinData) {
                checkinDates.add(dateStr);
            }
        }

        setCheckInDates(checkinDates);
    }, []);

    // Calendar helper functions
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
    }; const handleDateSelect = (day) => {
        if (!day) return;

        const selectedDateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);

        // Kiểm tra kế hoạch cai thuốc
        if (currentPlan) {
            const planStartDate = new Date(currentPlan.startDate);
            const planEndDate = new Date(planStartDate);
            planEndDate.setDate(planEndDate.getDate() + (currentPlan.weeks?.length || 0) * 7);

            // Không cho phép chọn ngày trước khi bắt đầu kế hoạch
            if (selectedDateObj < planStartDate) {
                alert('Không thể chọn ngày trước khi bắt đầu kế hoạch cai thuốc!');
                return;
            }

            // Không cho phép chọn ngày sau khi kết thúc kế hoạch
            if (selectedDateObj > planEndDate) {
                alert('Không thể chọn ngày sau khi kết thúc kế hoạch cai thuốc!');
                return;
            }
        }

        setSelectedDate(selectedDateObj);

        // Pass selected date to parent component
        if (onDateSelect) {
            const dateStr = selectedDateObj.toISOString().split('T')[0];
            onDateSelect(dateStr);
        }
    }; const getDayStatus = (day) => {
        if (!day) return '';

        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const dateStr = date.toISOString().split('T')[0];
        const today = new Date();

        // Reset time for comparison
        today.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);

        // Kiểm tra ngày có trong khoảng kế hoạch không
        if (currentPlan) {
            const planStartDate = new Date(currentPlan.startDate);
            const planEndDate = new Date(planStartDate);
            planEndDate.setDate(planEndDate.getDate() + (currentPlan.weeks?.length || 0) * 7);

            planStartDate.setHours(0, 0, 0, 0);
            planEndDate.setHours(0, 0, 0, 0);

            // Nếu ngày nằm ngoài khoảng kế hoạch
            if (date < planStartDate || date > planEndDate) {
                return 'out-of-plan';
            }
        }

        // Kiểm tra ngày hôm nay
        if (date.getTime() === today.getTime()) {
            return 'today';
        }

        // Kiểm tra ngày đã check-in
        if (checkInDates.has(dateStr)) {
            return 'checked-in';
        }

        // Ngày trong tương lai (nhưng trong khoảng kế hoạch) - cho phép chọn
        if (date > today) {
            return 'future-available';
        }

        // Ngày khả dụng trong quá khứ
        return 'available';
    }; const getDayClass = (day) => {
        const status = getDayStatus(day);
        const isSelected = selectedDate && day === selectedDate.getDate() &&
            currentMonth.getMonth() === selectedDate.getMonth() &&
            currentMonth.getFullYear() === selectedDate.getFullYear();

        let classes = ['calendar-day'];

        if (!day) classes.push('empty');
        if (status === 'today') classes.push('today');
        if (status === 'future-available') classes.push('future-available');
        if (status === 'out-of-plan') classes.push('out-of-plan');
        if (status === 'checked-in') classes.push('checked-in');
        if (status === 'available') classes.push('available');
        if (isSelected) classes.push('selected');

        return classes.join(' ');
    };

    const days = generateCalendarDays();
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    return (
        <div className="calendar-picker">            <div className="calendar-picker-header">
            <FaCalendarAlt className="calendar-icon" />
            <h3>Chọn ngày để check-in</h3>
            {currentPlan ? (
                <div className="plan-info">
                    <p>Kế hoạch: <strong>{currentPlan.name || 'Kế hoạch cá nhân'}</strong></p>
                    <p>Thời gian: {new Date(currentPlan.startDate).toLocaleDateString('vi-VN')} - {
                        new Date(new Date(currentPlan.startDate).getTime() + (currentPlan.weeks?.length || 0) * 7 * 24 * 60 * 60 * 1000)
                            .toLocaleDateString('vi-VN')
                    }</p>
                    <p className="note">Chỉ có thể check-in trong khoảng thời gian kế hoạch</p>
                </div>
            ) : (
                <p>Chọn bất kỳ ngày nào để ghi nhận tiến trình cai thuốc</p>
            )}
        </div>

            <div className="calendar-container">
                <div className="calendar-header">
                    <button onClick={goToPrevMonth} className="month-nav">
                        <FaArrowLeft />
                    </button>
                    <h4>{formatMonth(currentMonth)}</h4>
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
                            className={getDayClass(day)}
                            onClick={() => handleDateSelect(day)}
                        >
                            {day && (
                                <>
                                    <span className="day-number">{day}</span>
                                    {getDayStatus(day) === 'checked-in' && (
                                        <FaCheck className="check-icon" />
                                    )}
                                    {getDayStatus(day) === 'today' && (
                                        <div className="today-indicator"></div>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </div>                <div className="calendar-legend">
                    <div className="legend-item">
                        <div className="legend-color today"></div>
                        <span>Hôm nay</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-color checked-in">
                            <FaCheck />
                        </div>
                        <span>Đã check-in</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-color available"></div>
                        <span>Có thể check-in</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-color future-available"></div>
                        <span>Ngày tương lai (có thể chọn)</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-color out-of-plan">
                            <FaExclamationTriangle />
                        </div>
                        <span>Ngoài kế hoạch</span>
                    </div>
                </div>

                {selectedDate && (
                    <div className="selected-date-info">
                        <h4>Ngày đã chọn:</h4>
                        <p>{selectedDate.toLocaleDateString('vi-VN', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'numeric',
                            year: 'numeric'
                        })}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CalendarPicker;

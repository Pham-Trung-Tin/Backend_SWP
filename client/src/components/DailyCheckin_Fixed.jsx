import React, { useState, useEffect } from 'react';
import { FaCalendarCheck, FaSave, FaCalendarAlt, FaArrowLeft } from 'react-icons/fa';
import CalendarPicker from './CalendarPicker';
import { useAuth } from '../context/AuthContext';
import {
    saveCheckin,
    getCheckinByDate,
    getUserProgress,
    getProgressStats
} from '../services/progressService';

const DailyCheckin = ({ onProgressUpdate, currentPlan }) => {
    const { user, token } = useAuth();
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [todayData, setTodayData] = useState({
        date: new Date().toISOString().split('T')[0],
        targetCigarettes: 12, // Sẽ được tính từ kế hoạch
        actualCigarettes: 0,
        notes: '',
        moodRating: null,
        energyLevel: null,
        stressLevel: null
    });

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [currentWeek, setCurrentWeek] = useState(1); // Tuần hiện tại
    const [streakDays, setStreakDays] = useState(0); // Số ngày liên tiếp đạt mục tiêu
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' }); // Thông báo dạng toast
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Calculate if selected date is today
    const isToday = selectedDate === new Date().toISOString().split('T')[0];

    // Tính target cigarettes dựa trên kế hoạch và ngày hiện tại
    const calculateTodayTarget = () => {
        // Kiểm tra kỹ các trường hợp null/undefined
        if (!currentPlan) return 12;
        if (!currentPlan.weeks || !Array.isArray(currentPlan.weeks) || currentPlan.weeks.length === 0) return 12;
        if (!currentPlan.startDate) return currentPlan.weeks[0]?.amount || 12;

        try {
            const today = new Date();
            const startDate = new Date(currentPlan.startDate);

            // Kiểm tra ngày bắt đầu hợp lệ
            if (isNaN(startDate.getTime())) return currentPlan.weeks[0]?.amount || 12;

            const daysDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
            const currentWeekNumber = Math.floor(daysDiff / 7) + 1;

            setCurrentWeek(currentWeekNumber);

            // Tìm tuần hiện tại trong plan
            const currentWeekPlan = currentPlan.weeks.find(w => w.week === currentWeekNumber);
            if (currentWeekPlan) {
                // Lấy target của tuần trước nếu có
                const prevWeekPlan = currentPlan.weeks.find(w => w.week === currentWeekNumber - 1);
                if (prevWeekPlan && prevWeekPlan.amount > currentWeekPlan.amount) {
                    const reduction = prevWeekPlan.amount - currentWeekPlan.amount;
                    const percentReduction = Math.round((reduction / prevWeekPlan.amount) * 100);

                    // Lưu thông tin tiến độ so với tuần trước
                    setTodayData(prev => ({
                        ...prev,
                        weeklyProgress: {
                            reduction,
                            percentReduction,
                            prevWeekTarget: prevWeekPlan.amount,
                            currentWeekTarget: currentWeekPlan.amount
                        }
                    }));
                }

                return currentWeekPlan.amount;
            }

            // Nếu đã qua hết kế hoạch, target = 0
            if (currentWeekNumber > currentPlan.weeks.length) {
                return 0;
            }

            // Fallback
            return currentPlan.weeks[0]?.amount || 12;
        } catch (error) {
            console.error("Lỗi khi tính toán mục tiêu hôm nay:", error);
            return 12; // Fallback an toàn nếu có lỗi
        }
    };

    // Tính target cho ngày cụ thể
    const calculateTargetForDate = (dateStr) => {
        if (!currentPlan || !currentPlan.weeks || currentPlan.weeks.length === 0) {
            return 12;
        }

        try {
            const targetDate = new Date(dateStr);
            const startDate = new Date(currentPlan.startDate);

            if (isNaN(targetDate.getTime()) || isNaN(startDate.getTime())) {
                return currentPlan.weeks[0]?.amount || 12;
            }

            const daysDiff = Math.floor((targetDate - startDate) / (1000 * 60 * 60 * 24));
            const weekNumber = Math.floor(daysDiff / 7) + 1;

            const weekPlan = currentPlan.weeks.find(w => w.week === weekNumber);
            return weekPlan ? weekPlan.amount : (weekNumber > currentPlan.weeks.length ? 0 : 12);
        } catch (error) {
            console.error("Lỗi khi tính target cho ngày:", dateStr, error);
            return 12;
        }
    };

    // Load streak data from API
    const loadStreakData = async () => {
        if (!token) return;

        try {
            const stats = await getProgressStats(token, 30);
            setStreakDays(stats.current_streak || 0);
        } catch (error) {
            console.error('Error loading streak data:', error);
        }
    };

    // Load data for selected date from API
    const loadDataForDate = async (dateStr) => {
        if (!token) {
            // If no token, use local calculation only
            const target = calculateTargetForDate(dateStr);
            setTodayData({
                date: dateStr,
                targetCigarettes: target,
                actualCigarettes: 0,
                notes: '',
                moodRating: null,
                energyLevel: null,
                stressLevel: null
            });
            setIsSubmitted(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const target = calculateTargetForDate(dateStr);
            const existingCheckin = await getCheckinByDate(dateStr, token);

            if (existingCheckin) {
                setTodayData({
                    date: dateStr,
                    targetCigarettes: existingCheckin.target_cigarettes,
                    actualCigarettes: existingCheckin.actual_cigarettes,
                    notes: existingCheckin.notes || '',
                    moodRating: existingCheckin.mood_rating,
                    energyLevel: existingCheckin.energy_level,
                    stressLevel: existingCheckin.stress_level
                });
                setIsSubmitted(true);
            } else {
                setTodayData({
                    date: dateStr,
                    targetCigarettes: target,
                    actualCigarettes: 0,
                    notes: '',
                    moodRating: null,
                    energyLevel: null,
                    stressLevel: null
                });
                setIsSubmitted(false);
            }
        } catch (error) {
            console.error('Error loading data for date:', error);
            setError('Failed to load checkin data');

            // Fallback to default data
            const target = calculateTargetForDate(dateStr);
            setTodayData({
                date: dateStr,
                targetCigarettes: target,
                actualCigarettes: 0,
                notes: '',
                moodRating: null,
                energyLevel: null,
                stressLevel: null
            });
            setIsSubmitted(false);
        } finally {
            setLoading(false);
        }
    };

    // Xử lý chọn ngày từ calendar
    const handleDateSelect = (dateStr) => {
        setSelectedDate(dateStr);
        loadDataForDate(dateStr);
        setShowCalendar(false);
    };

    // Xử lý thay đổi input
    const handleInputChange = (field, value) => {
        setTodayData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Lưu checkin
    const handleSaveCheckin = async () => {
        if (!token) {
            showToast('Vui lòng đăng nhập để lưu checkin!', 'error');
            return;
        }

        if (todayData.actualCigarettes < 0) {
            showToast('Số điếu hút không thể âm!', 'error');
            return;
        }

        setLoading(true);
        try {
            const checkinData = {
                date: selectedDate,
                targetCigarettes: todayData.targetCigarettes,
                actualCigarettes: todayData.actualCigarettes,
                notes: todayData.notes,
                moodRating: todayData.moodRating,
                energyLevel: todayData.energyLevel,
                stressLevel: todayData.stressLevel
            };

            await saveCheckin(checkinData, token);

            setIsSubmitted(true);
            showToast('Checkin đã được lưu thành công!', 'success');

            // Reload streak data
            await loadStreakData();

            // Notify parent component if callback provided
            if (onProgressUpdate) {
                onProgressUpdate(checkinData);
            }

        } catch (error) {
            console.error('Error saving checkin:', error);
            showToast(error.message || 'Có lỗi xảy ra khi lưu checkin!', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Hiển thị toast notification
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast(prev => ({ ...prev, show: false }));
        }, 3000);
    };

    // Đóng toast
    const closeToast = () => {
        const toastElement = document.querySelector('.toast-notification');
        if (toastElement) {
            toastElement.classList.add('toast-exit');
            setTimeout(() => {
                setToast({ ...toast, show: false });
            }, 300); // Đợi animation kết thúc
        } else {
            setToast({ ...toast, show: false });
        }
    };

    // Effects
    useEffect(() => {
        if (currentPlan) {
            calculateTodayTarget();
        }
    }, [currentPlan]);

    useEffect(() => {
        loadDataForDate(selectedDate);
    }, [selectedDate, token]);

    useEffect(() => {
        if (token) {
            loadStreakData();
        }
    }, [token]);

    return (
        <div className="daily-checkin">
            <div className="checkin-header">
                <div className="header-content">
                    <FaCalendarCheck className="header-icon" />
                    <div className="header-text">
                        <h2>{isToday ? 'Checkin hôm nay' : 'Checkin ngày đã chọn'}</h2>
                        <p>Ghi nhận tiến trình cai thuốc ngày {new Date(selectedDate).toLocaleDateString('vi-VN')}</p>
                        {currentPlan && (
                            <p className="plan-week-info">
                                Tuần {currentWeek} - Mục tiêu: {todayData.targetCigarettes} điếu/ngày
                            </p>
                        )}
                    </div>
                </div>

                <div className="header-actions">
                    {/* Calendar button */}
                    <button
                        className="calendar-button"
                        onClick={() => setShowCalendar(true)}
                        title="Chọn ngày khác"
                    >
                        <FaCalendarAlt />
                    </button>

                    {/* Streak counter */}
                    <div className="streak-badge">
                        <span className="streak-number">{streakDays}</span>
                        <span className="streak-text">ngày liên tiếp</span>
                    </div>
                </div>
            </div>

            {/* Toast Notification */}
            {toast.show && (
                <div className={`toast-notification ${toast.type}`}>
                    <span className="toast-message">{toast.message}</span>
                    <button className="toast-close" onClick={closeToast}>&times;</button>
                </div>
            )}

            {/* Error message */}
            {error && (
                <div className="error-message">
                    <p>⚠️ {error}</p>
                </div>
            )}

            {/* Loading spinner */}
            {loading && (
                <div className="loading-spinner">
                    <p>⏳ Đang tải...</p>
                </div>
            )}

            {/* Calendar Modal */}
            {showCalendar && (
                <div className="calendar-modal">
                    <div className="calendar-overlay" onClick={() => setShowCalendar(false)}>
                        <div className="calendar-content" onClick={(e) => e.stopPropagation()}>
                            <div className="calendar-header">
                                <button
                                    className="back-button"
                                    onClick={() => setShowCalendar(false)}
                                >
                                    <FaArrowLeft /> Quay lại
                                </button>
                                <h3>Chọn ngày checkin</h3>
                            </div>
                            <CalendarPicker
                                selectedDate={selectedDate}
                                onDateSelect={handleDateSelect}
                                maxDate={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Checkin Form */}
            <div className="checkin-form">
                <div className="form-group">
                    <label htmlFor="target">Mục tiêu hôm nay</label>
                    <div className="input-with-unit">
                        <input
                            id="target"
                            type="number"
                            value={todayData.targetCigarettes}
                            onChange={(e) => handleInputChange('targetCigarettes', parseInt(e.target.value) || 0)}
                            min="0"
                            disabled={!isToday}
                        />
                        <span className="unit">điếu</span>
                    </div>
                    <small>Số điếu thuốc bạn dự định hút trong ngày</small>
                </div>

                <div className="form-group">
                    <label htmlFor="actual">Thực tế đã hút</label>
                    <div className="input-with-unit">
                        <input
                            id="actual"
                            type="number"
                            value={todayData.actualCigarettes}
                            onChange={(e) => handleInputChange('actualCigarettes', parseInt(e.target.value) || 0)}
                            min="0"
                        />
                        <span className="unit">điếu</span>
                    </div>
                    <small>Số điếu thuốc bạn đã hút thực tế</small>
                </div>

                {/* Mood, Energy, Stress Rating */}
                <div className="rating-group">
                    <div className="form-group">
                        <label>Tâm trạng</label>
                        <div className="rating-scale">
                            {[1, 2, 3, 4, 5].map(rating => (
                                <button
                                    key={rating}
                                    type="button"
                                    className={`rating-btn ${todayData.moodRating === rating ? 'active' : ''}`}
                                    onClick={() => handleInputChange('moodRating', rating)}
                                >
                                    {rating}
                                </button>
                            ))}
                        </div>
                        <small>1 = Rất tệ, 5 = Rất tốt</small>
                    </div>

                    <div className="form-group">
                        <label>Năng lượng</label>
                        <div className="rating-scale">
                            {[1, 2, 3, 4, 5].map(rating => (
                                <button
                                    key={rating}
                                    type="button"
                                    className={`rating-btn ${todayData.energyLevel === rating ? 'active' : ''}`}
                                    onClick={() => handleInputChange('energyLevel', rating)}
                                >
                                    {rating}
                                </button>
                            ))}
                        </div>
                        <small>1 = Rất thấp, 5 = Rất cao</small>
                    </div>

                    <div className="form-group">
                        <label>Stress</label>
                        <div className="rating-scale">
                            {[1, 2, 3, 4, 5].map(rating => (
                                <button
                                    key={rating}
                                    type="button"
                                    className={`rating-btn ${todayData.stressLevel === rating ? 'active' : ''}`}
                                    onClick={() => handleInputChange('stressLevel', rating)}
                                >
                                    {rating}
                                </button>
                            ))}
                        </div>
                        <small>1 = Rất thấp, 5 = Rất cao</small>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="notes">Ghi chú</label>
                    <textarea
                        id="notes"
                        value={todayData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        placeholder="Ghi chú về cảm giác, khó khăn hoặc thành tựu của bạn..."
                        rows="3"
                    />
                </div>

                <div className="form-actions">
                    <button
                        className={`save-button ${isSubmitted ? 'submitted' : ''}`}
                        onClick={handleSaveCheckin}
                        disabled={loading || !token}
                    >
                        <FaSave />
                        {loading ? 'Đang lưu...' :
                            isSubmitted ? `Đã lưu checkin ngày ${new Date(selectedDate).toLocaleDateString('vi-VN')}` :
                                isToday ? 'Lưu checkin hôm nay' : `Lưu checkin ngày ${new Date(selectedDate).toLocaleDateString('vi-VN')}`}
                    </button>

                    {!token && (
                        <p className="login-notice">
                            Vui lòng đăng nhập để lưu checkin vào hệ thống
                        </p>
                    )}
                </div>
            </div>

            {/* Progress Indicator */}
            {todayData.actualCigarettes <= todayData.targetCigarettes && isSubmitted && (
                <div className="success-indicator">
                    <h3>🎉 Chúc mừng!</h3>
                    <p>Bạn đã đạt mục tiêu hôm nay!</p>
                </div>
            )}
        </div>
    );
};

export default DailyCheckin;

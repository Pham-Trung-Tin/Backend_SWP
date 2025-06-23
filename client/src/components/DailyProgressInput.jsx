import React, { useState } from 'react';
import './DailyProgressInput.css';

const DailyProgressInput = ({ onSubmit, todayTarget = 0 }) => {
    const [actualCigarettes, setActualCigarettes] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const today = new Date().toISOString().split('T')[0];
    const todayFormatted = new Date().toLocaleDateString('vi-VN');

    const handleSubmit = async (e) => {
        e.preventDefault(); if (actualCigarettes === '') {
            alert('Vui lòng nhập số điếu thuốc đã hút hôm nay');
            return;
        }

        setIsSubmitting(true); const progressData = {
            date: today,
            actualCigarettes: parseInt(actualCigarettes),
            targetCigarettes: todayTarget,
            notes: notes.trim(),
            timestamp: new Date().toISOString()
        };

        try {
            await onSubmit(progressData);            // Reset form after successful submission
            setActualCigarettes('');
            setNotes('');

            alert('Đã cập nhật tiến trình hôm nay thành công!');
        } catch (error) {
            console.error('Error submitting progress:', error);
            alert('Có lỗi xảy ra khi cập nhật. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getProgressMessage = () => {
        if (actualCigarettes === '') return '';

        const actual = parseInt(actualCigarettes);
        const target = todayTarget;

        if (actual <= target) {
            return {
                message: `Tuyệt vời! Bạn đã đạt mục tiêu hôm nay! 🎉`,
                type: 'success'
            };
        } else {
            return {
                message: `Đừng lo lắng, ngày mai sẽ tốt hơn! Hãy cố gắng nhé! 💪`,
                type: 'warning'
            };
        }
    };

    const progressMessage = getProgressMessage();

    return (
        <div className="daily-progress-input">
            <div className="input-header">
                <h3>📊 Cập nhật tiến trình hôm nay</h3>
                <p className="date-display">Ngày: {todayFormatted}</p>
                <p className="target-display">Mục tiêu hôm nay: <strong>{todayTarget} điếu</strong></p>
            </div>

            <form onSubmit={handleSubmit} className="progress-form">
                <div className="form-group">
                    <label htmlFor="actualCigarettes">
                        🚬 Số điếu thuốc đã hút hôm nay:
                    </label>
                    <input
                        type="number"
                        id="actualCigarettes"
                        value={actualCigarettes}
                        onChange={(e) => setActualCigarettes(e.target.value)}
                        min="0"
                        max="100"
                        placeholder="Nhập số điếu (ví dụ: 5)"
                        className="number-input"
                    />

                    {progressMessage && (
                        <div className={`progress-message ${progressMessage.type}`}>
                            {progressMessage.message}
                        </div>
                    )}                </div>

                <div className="form-group">
                    <label htmlFor="notes">
                        📝 Ghi chú (tùy chọn):
                    </label>
                    <textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Chia sẻ cảm nghĩ, khó khăn, hoặc thành tựu của bạn hôm nay..."
                        rows="3"
                        maxLength="500"
                        className="notes-textarea"
                    />
                    <div className="char-count">{notes.length}/500</div>
                </div>

                <button
                    type="submit"
                    className="submit-btn"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <span className="loading-spinner"></span>
                            Đang lưu...
                        </>
                    ) : (
                        <>
                            💾 Lưu tiến trình hôm nay
                        </>
                    )}
                </button>
            </form>

            <div className="tips-section">
                <h4>💡 Mẹo nhỏ:</h4>
                <ul>
                    <li>Hãy trung thực với số liệu để theo dõi tiến trình chính xác</li>
                    <li>Nếu vượt mục tiêu, đừng nản chí - ngày mai là cơ hội mới</li>
                    <li>Ghi chú giúp bạn nhận ra các yếu tố ảnh hưởng đến việc cai thuốc</li>
                </ul>
            </div>
        </div>
    );
};

export default DailyProgressInput;

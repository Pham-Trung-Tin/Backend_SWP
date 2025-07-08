import React, { useState, useEffect } from 'react';
import { FaSmile, FaMeh, FaFrown, FaTired } from 'react-icons/fa';

const MoodTracking = ({ onMoodUpdate }) => {
    const [moodData, setMoodData] = useState({
        date: new Date().toISOString().split('T')[0],
        mood: '',
        notes: '',
        challenges: [],
        achievements: []
    });

    const [isSubmitted, setIsSubmitted] = useState(false);

    // Các lựa chọn tâm trạng
    const moodOptions = [
        { id: 'easy', label: 'Rất dễ dàng', icon: FaSmile, color: '#34a853', description: 'Không có cảm giác thèm thuốc' },
        { id: 'good', label: 'Tốt', icon: FaSmile, color: '#4285f4', description: 'Thỉnh thoảng nghĩ đến nhưng kiểm soát được' },
        { id: 'challenging', label: 'Hơi khó', icon: FaMeh, color: '#ff9800', description: 'Có lúc muốn hút nhưng đã cưỡng lại' },
        { id: 'difficult', label: 'Khó khăn', icon: FaFrown, color: '#f44336', description: 'Rất muốn hút, phải nỗ lực nhiều' },
        { id: 'very-hard', label: 'Rất khó', icon: FaTired, color: '#9c27b0', description: 'Suýt tái nghiện, cần hỗ trợ' }
    ];

    // Các thách thức phổ biến
    const commonChallenges = [
        'Stress công việc',
        'Áp lực xã hội',
        'Sau bữa ăn',
        'Uống cà phê',
        'Gặp người hút thuốc',
        'Buồn chán',
        'Mệt mỏi',
        'Khác'
    ];

    // Các thành tựu hàng ngày
    const dailyAchievements = [
        'Từ chối lời mời hút thuốc',
        'Tập thể dục thay vì hút thuốc',
        'Uống nước thay vì hút thuốc',
        'Ăn kẹo/nhai kẹo cao su',
        'Hít thở sâu khi căng thẳng',
        'Tìm hoạt động thay thế',
        'Chia sẻ với người thân',
        'Đọc sách/nghe nhạc'
    ];

    // Kiểm tra xem hôm nay đã update mood chưa
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const savedData = localStorage.getItem(`mood_${today}`);
        if (savedData) {
            const data = JSON.parse(savedData);
            setMoodData(data);
            setIsSubmitted(true);
        }
    }, []);

    const handleInputChange = (field, value) => {
        setMoodData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleChallengeToggle = (challenge) => {
        setMoodData(prev => ({
            ...prev,
            challenges: prev.challenges.includes(challenge)
                ? prev.challenges.filter(c => c !== challenge)
                : [...prev.challenges, challenge]
        }));
    };

    const handleAchievementToggle = (achievement) => {
        setMoodData(prev => ({
            ...prev,
            achievements: prev.achievements.includes(achievement)
                ? prev.achievements.filter(a => a !== achievement)
                : [...prev.achievements, achievement]
        }));
    };

    const handleSubmit = () => {
        // Lưu dữ liệu vào localStorage
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem(`mood_${today}`, JSON.stringify(moodData));

        setIsSubmitted(true);

        // Callback để cập nhật component cha
        if (onMoodUpdate) {
            onMoodUpdate(moodData);
        }

        // Hiển thị thông báo thành công
        alert('✅ Đã lưu thông tin tâm trạng hôm nay!');
    };

    const handleEdit = () => {
        setIsSubmitted(false);
    };

    const selectedMood = moodOptions.find(m => m.id === moodData.mood);

    return (
        <div className="mood-tracking">
            <div className="mood-header">
                <h2>Tâm trạng & Cảm nhận hôm nay</h2>
                <p>Chia sẻ cảm nhận của bạn về quá trình cai thuốc ngày {new Date().toLocaleDateString('vi-VN')}</p>
            </div>

            <div className="mood-content">
                {/* Mood Selection */}
                <div className="mood-section">
                    <h3>Tâm trạng hôm nay như thế nào?</h3>
                    <div className="mood-options">
                        {moodOptions.map(mood => {
                            const IconComponent = mood.icon;
                            return (
                                <div
                                    key={mood.id}
                                    className={`mood-option ${moodData.mood === mood.id ? 'selected' : ''}`}
                                    onClick={() => !isSubmitted && handleInputChange('mood', mood.id)}
                                    style={{ borderColor: moodData.mood === mood.id ? mood.color : '#e0e0e0' }}
                                >
                                    <IconComponent
                                        className="mood-icon"
                                        style={{ color: mood.color }}
                                    />
                                    <span className="mood-label">{mood.label}</span>
                                    <span className="mood-desc">{mood.description}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Challenges */}
                <div className="challenges-section">
                    <h3>Khó khăn gặp phải hôm nay (có thể chọn nhiều)</h3>
                    <div className="challenge-tags">
                        {commonChallenges.map(challenge => (
                            <label key={challenge} className="challenge-tag">
                                <input
                                    type="checkbox"
                                    checked={moodData.challenges.includes(challenge)}
                                    onChange={() => handleChallengeToggle(challenge)}
                                    disabled={isSubmitted}
                                />
                                <span className="tag-text">{challenge}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Achievements */}
                <div className="achievements-section">
                    <h3>Thành tựu đạt được hôm nay</h3>
                    <div className="achievement-tags">
                        {dailyAchievements.map(achievement => (
                            <label key={achievement} className="achievement-tag">
                                <input
                                    type="checkbox"
                                    checked={moodData.achievements.includes(achievement)}
                                    onChange={() => handleAchievementToggle(achievement)}
                                    disabled={isSubmitted}
                                />
                                <span className="tag-text">{achievement}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Notes */}
                <div className="notes-section">
                    <h3>Ghi chú thêm (tùy chọn)</h3>
                    <textarea
                        value={moodData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        placeholder="Chia sẻ cảm nghĩ, trải nghiệm hoặc điều gì đó đặc biệt hôm nay..."
                        className="notes-textarea"
                        disabled={isSubmitted}
                        rows={4}
                    />
                </div>

                {/* Action Buttons */}
                <div className="mood-actions">
                    {!isSubmitted ? (
                        <button
                            onClick={handleSubmit}
                            className="submit-btn"
                            disabled={!moodData.mood}
                        >
                            Lưu tâm trạng hôm nay
                        </button>
                    ) : (
                        <div className="submitted-state">
                            <div className="success-message">
                                ✅ Đã ghi nhận tâm trạng hôm nay!
                            </div>
                            <button onClick={handleEdit} className="edit-btn">
                                Chỉnh sửa
                            </button>
                        </div>
                    )}
                </div>

                {/* Summary Card */}
                {isSubmitted && (
                    <div className="mood-summary">
                        <h3>Tóm tắt tâm trạng hôm nay</h3>
                        <div className="summary-content">
                            <div className="summary-item">
                                <span className="label">Tâm trạng:</span>
                                <span className="value">
                                    {selectedMood && (
                                        <>
                                            <selectedMood.icon style={{ color: selectedMood.color, marginRight: '5px' }} />
                                            {selectedMood.label}
                                        </>
                                    )}
                                </span>
                            </div>
                            {moodData.challenges.length > 0 && (
                                <div className="summary-item">
                                    <span className="label">Thách thức:</span>
                                    <span className="value">{moodData.challenges.join(', ')}</span>
                                </div>
                            )}
                            {moodData.achievements.length > 0 && (
                                <div className="summary-item">
                                    <span className="label">Thành tựu:</span>
                                    <span className="value">{moodData.achievements.join(', ')}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MoodTracking;

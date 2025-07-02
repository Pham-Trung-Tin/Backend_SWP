import React, { useState, useEffect } from 'react';
import { FaCalendarCheck, FaChartLine, FaTrophy, FaLightbulb, FaHeart, FaMoneyBillWave, FaBan } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import QuitProgressChart from '../components/QuitProgressChart';
import DailyProgressInput from '../components/DailyProgressInput';
import '../styles/Progress_New.css';
import { getUserProgress, getProgressStats, getCheckinByDate } from '../services/progressService';

export default function Progress_New() {
    const { user } = useAuth();
    const [userPlan, setUserPlan] = useState(null);
    const [progressData, setProgressData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
    const [todayCheckin, setTodayCheckin] = useState(null);
    const [timeFilter, setTimeFilter] = useState('30 ngày');
    const [progressStats, setProgressStats] = useState({
        daysSmokeFree: 0,
        cigarettesSaved: 0,
        moneySaved: 0,
        streakDays: 0,
        weeklyProgress: null
    });
    const [milestones, setMilestones] = useState([]);
    const [showInput, setShowInput] = useState(false);

    useEffect(() => {
        loadUserPlanAndProgress();
    }, [user]);

    const loadUserPlanAndProgress = async () => {
        setIsLoading(true);
        try {
            // Lấy kế hoạch từ localStorage
            const savedPlan = localStorage.getItem('journeyStepperData') || localStorage.getItem('activePlan');
            const currentPlan = savedPlan ? JSON.parse(savedPlan) : createDefaultPlan();

            if (currentPlan.selectedPlan) {
                // Format từ journeyStepperData
                setUserPlan({
                    id: Date.now(),
                    name: currentPlan.selectedPlan.name || 'Kế hoạch cá nhân',
                    startDate: currentPlan.startDate || new Date().toISOString().split('T')[0],
                    weeks: currentPlan.selectedPlan.weeks || []
                });
            } else {
                setUserPlan(currentPlan);
            }

            // Lấy dữ liệu tiến độ từ API nếu đã đăng nhập
            if (user && user.token) {
                const progress = await getUserProgress(user.token);
                setProgressData(progress);

                // Lấy checkin hôm nay
                const today = new Date().toISOString().split('T')[0];
                const todayData = await getCheckinByDate(today, user.token);
                setTodayCheckin(todayData);

                // Tính thống kê tiến độ
                calculateProgressStats(progress, currentPlan);

                // Tạo các milestone sức khỏe
                createHealthMilestones(progress);
            }
        } catch (error) {
            console.error('Error loading plan and progress:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const calculateProgressStats = (progress, plan) => {
        // Tính ngày không hút thuốc
        const today = new Date();
        const daysSmokeFree = progress.filter(p => p.actualCigarettes === 0).length;

        // Tính số điếu tiết kiệm được
        let totalSaved = 0;
        progress.forEach(day => {
            const target = day.targetCigarettes || 0;
            const actual = day.actualCigarettes || 0;
            if (actual < target) {
                totalSaved += (target - actual);
            }
        });

        // Tính tiền tiết kiệm (giả sử 1 điếu = 3,000đ)
        const moneySaved = totalSaved * 3000;

        // Tính streak ngày đạt mục tiêu
        let currentStreak = 0;
        const sortedProgress = [...progress].sort((a, b) =>
            new Date(b.date) - new Date(a.date));

        for (const day of sortedProgress) {
            if (day.actualCigarettes <= day.targetCigarettes) {
                currentStreak++;
            } else {
                break;
            }
        }

        setProgressStats({
            daysSmokeFree,
            cigarettesSaved: totalSaved,
            moneySaved,
            streakDays: currentStreak
        });
    };

    const createHealthMilestones = (progress) => {
        // Milestone theo thời gian WHO
        const healthMilestones = [
            { days: 1, title: '24 giờ đầu tiên', description: 'Carbon monoxide được loại bỏ khỏi cơ thể', achieved: false },
            { days: 2, title: '48 giờ', description: 'Nicotine được loại bỏ, vị giác cải thiện', achieved: false },
            { days: 3, title: '72 giờ', description: 'Đường hô hấp thư giãn, năng lượng tăng', achieved: false },
            { days: 14, title: '2 tuần', description: 'Tuần hoàn máu cải thiện', achieved: false },
            { days: 30, title: '1 tháng', description: 'Chức năng phổi tăng 30%', achieved: false },
            { days: 90, title: '3 tháng', description: 'Ho và khó thở giảm đáng kể', achieved: false },
            { days: 365, title: '1 năm', description: 'Nguy cơ bệnh tim giảm 50%', achieved: false }
        ];

        // Tính số ngày đã cai thuốc liên tục
        const consecutiveSmokeFree = getConsecutiveSmokeFree(progress);

        const updatedMilestones = healthMilestones.map(milestone => ({
            ...milestone,
            achieved: consecutiveSmokeFree >= milestone.days
        }));

        setMilestones(updatedMilestones);
    };

    const getConsecutiveSmokeFree = (progress) => {
        let days = 0;
        const sortedProgress = [...progress].sort((a, b) =>
            new Date(b.date) - new Date(a.date));

        for (const day of sortedProgress) {
            if (day.actualCigarettes === 0) {
                days++;
            } else {
                break;
            }
        }

        return days;
    };

    const createDefaultPlan = () => {
        return {
            id: Date.now(),
            name: "Kế hoạch 6 tuần",
            startDate: new Date().toISOString().split('T')[0],
            weeks: [
                { week: 1, amount: 20, phase: "Thích nghi" },
                { week: 2, amount: 16, phase: "Thích nghi" },
                { week: 3, amount: 12, phase: "Tăng tốc" },
                { week: 4, amount: 8, phase: "Tăng tốc" },
                { week: 5, amount: 5, phase: "Hoàn thiện" },
                { week: 6, amount: 2, phase: "Hoàn thiện" },
                { week: 7, amount: 0, phase: "Hoàn thành" }
            ]
        };
    };

    const handleProgressUpdate = () => {
        loadUserPlanAndProgress();
    };

    const toggleCheckinInput = () => {
        setShowInput(!showInput);
    };

    // Tính mục tiêu hôm nay
    const calculateTodayTarget = () => {
        if (!userPlan || !userPlan.weeks || userPlan.weeks.length === 0) return 0;

        try {
            const startDate = new Date(userPlan.startDate);
            const today = new Date();
            const daysDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
            const weekNum = Math.floor(daysDiff / 7);

            if (weekNum < 0) return userPlan.weeks[0].amount;
            if (weekNum >= userPlan.weeks.length) return 0;

            return userPlan.weeks[weekNum].amount;
        } catch (error) {
            console.error("Error calculating target:", error);
            return 0;
        }
    };

    if (isLoading) {
        return <div className="loading">Đang tải...</div>;
    }

    return (
        <div className="progress-container">
            {/* Thanh điều hướng - giống ảnh chụp màn hình */}
            <div className="progress-nav">
                <a href="/" className="nav-item">
                    <i className="nav-icon">🏠</i> Trang chủ
                </a>
                <a href="/ke-hoach" className="nav-item">
                    <i className="nav-icon">📋</i> Kế hoạch cai thuốc
                </a>
                <a href="/progress-new" className="nav-item active">
                    <i className="nav-icon">📊</i> Tiến trình
                </a>
                <a href="/appointment" className="nav-item">
                    <i className="nav-icon">📅</i> Đặt lịch Coach
                </a>
                <a href="/blog" className="nav-item">
                    <i className="nav-icon">👥</i> Cộng đồng
                </a>
            </div>

            <h1>Tiến trình</h1>

            {/* Phần ghi nhận hôm nay */}
            <div className="daily-checkin-section">
                <div className="section-header">
                    <h2><FaCalendarCheck /> Ghi nhận hôm nay</h2>
                    <span className="date-display">Ghi nhận tiến độ cai thuốc ngày {new Date().toLocaleDateString('vi-VN')}</span>
                </div>

                <div className="checkin-content">
                    <div className="target-vs-actual">
                        <div className="target-box">
                            <h3>Mục tiêu hôm nay</h3>
                            <div className="big-number">{calculateTodayTarget()}</div>
                            <div className="target-label">Tuần {Math.floor((new Date() - new Date(userPlan?.startDate || new Date())) / (1000 * 60 * 60 * 24 * 7)) + 1} - Kế hoạch của bạn</div>
                        </div>

                        <div className="vs-separator">VS</div>

                        <div className="actual-box">
                            <h3>Thực tế đã hút</h3>
                            <div className="big-number">{todayCheckin ? todayCheckin.actualCigarettes : 0}</div>
                            <div className="target-label">
                                {todayCheckin ? '✓ Đạt mục tiêu!' : '+ Nhập số liệu'}
                            </div>
                        </div>
                    </div>

                    <button
                        className="checkin-button"
                        onClick={toggleCheckinInput}
                    >
                        Làm checkin hôm nay
                    </button>

                    {showInput && (
                        <DailyProgressInput
                            onProgressUpdate={handleProgressUpdate}
                            currentPlan={userPlan}
                            onClose={() => setShowInput(false)}
                        />
                    )}
                </div>
            </div>

            {/* Thống kê tổng quan */}
            <div className="stats-row">
                <div className="stat-box streak">
                    <div className="stat-icon">
                        <FaCalendarCheck />
                    </div>
                    <div className="stat-content">
                        <h3>{progressStats.daysSmokeFree || 0}</h3>
                        <p>Ngày không hút</p>
                    </div>
                </div>

                <div className="stat-box achievement">
                    <div className="stat-icon">
                        <FaBan />
                    </div>
                    <div className="stat-content">
                        <h3>{progressStats.cigarettesSaved || 0}</h3>
                        <p>Điếu thuốc đã tránh</p>
                    </div>
                </div>

                <div className="stat-box savings">
                    <div className="stat-icon">
                        <FaMoneyBillWave />
                    </div>
                    <div className="stat-content">
                        <h3>{(progressStats.moneySaved / 1000).toFixed(0)}K</h3>
                        <p>VNĐ đã tiết kiệm</p>
                    </div>
                </div>

                <div className="stat-box health">
                    <div className="stat-icon">
                        <FaHeart />
                    </div>
                    <div className="stat-content">
                        <h3>
                            {milestones.filter(m => m.achieved).length > 0
                                ? Math.round((milestones.filter(m => m.achieved).length / milestones.length) * 100)
                                : 0}%
                        </h3>
                        <p>Milestone sức khỏe</p>
                    </div>
                </div>
            </div>

            {/* Biểu đồ tiến độ */}
            <div className="chart-section">
                <h2>
                    <FaChartLine className="section-icon" />
                    Kế hoạch của bạn
                </h2>
                <div className="chart-container">
                    <QuitProgressChart
                        userPlan={userPlan || { weeks: [], name: 'Kế hoạch cá nhân' }}
                        actualProgress={progressData}
                        timeFilter={timeFilter}
                        height={250}
                    />
                </div>

                {/* Time Filter Controls */}
                <div className="time-filters">
                    <button
                        className={`time-filter ${timeFilter === '7 ngày' ? 'active' : ''}`}
                        onClick={() => setTimeFilter('7 ngày')}
                    >
                        7 ngày
                    </button>
                    <button
                        className={`time-filter ${timeFilter === '14 ngày' ? 'active' : ''}`}
                        onClick={() => setTimeFilter('14 ngày')}
                    >
                        14 ngày
                    </button>
                    <button
                        className={`time-filter ${timeFilter === '30 ngày' ? 'active' : ''}`}
                        onClick={() => setTimeFilter('30 ngày')}
                    >
                        30 ngày
                    </button>
                    <button
                        className={`time-filter ${timeFilter === 'Tất cả' ? 'active' : ''}`}
                        onClick={() => setTimeFilter('Tất cả')}
                    >
                        Tất cả
                    </button>
                </div>
            </div>

            {/* Milestone sức khỏe */}
            <div className="milestones-section">
                <h2>
                    <FaTrophy className="section-icon" />
                    Milestone sức khỏe
                </h2>
                <div className="milestones-grid">
                    {milestones.map((milestone, index) => (
                        <div key={index} className={`milestone-card ${milestone.achieved ? 'achieved' : 'pending'}`}>
                            <div className="milestone-indicator">
                                {milestone.achieved ? '✅' : '⏳'}
                            </div>
                            <div className="milestone-content">
                                <h4>{milestone.title}</h4>
                                <p>{milestone.description}</p>
                                <div className="milestone-days">
                                    {milestone.achieved ?
                                        <span className="achieved-text">Đạt được</span> :
                                        <span className="days-left">Còn {milestone.days - (progressStats.daysSmokeFree || 0)} ngày nữa</span>
                                    }
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Lời khuyên duy trì */}
            <div className="tips-section">
                <h2>
                    <FaLightbulb className="section-icon" />
                    Lời khuyên duy trì
                </h2>
                <div className="tips-content">
                    <ul>
                        <li>Tiếp tục tránh xa môi trường có khói thuốc</li>
                        <li>Duy trì các hoạt động thể chất thường xuyên</li>
                        <li>Ăn uống lành mạnh để tránh tăng cân</li>
                        <li>Tìm kiếm hỗ trợ từ gia đình và bạn bè</li>
                        <li>Nhắc nhở bản thân về lợi ích đã đạt được</li>
                    </ul>
                </div>
            </div>

            {/* Câu chuyện thành công */}
            <div className="success-story">
                <h2>🎉 Câu chuyện thành công của bạn</h2>
                <div className="story-content">
                    <p>
                        Bạn đã lập thành công <strong>{userPlan?.name || 'Kế hoạch cá nhân'}</strong> và duy trì được{' '}
                        <strong>{progressStats.daysSmokeFree || 0} ngày</strong> không hút thuốc.
                    </p>
                    <p>
                        Trong thời gian này, bạn đã tiết kiệm được <strong>{(progressStats.moneySaved / 1000).toFixed(0)}K VNĐ</strong>{' '}
                        và tránh được <strong>{progressStats.cigarettesSaved || 0} điếu thuốc</strong>.
                    </p>
                    <p>
                        Thành tích này đã giúp cơ thể bạn phục hồi và sức khỏe được cải thiện đáng kể.{' '}
                        <strong>Hãy tiếp tục duy trì!</strong>
                    </p>
                </div>
            </div>

            {/* Phần hỗ trợ thêm */}
            <div className="support-options">
                <h3>🤝 Hỗ trợ thêm</h3>
                <div className="support-buttons">
                    <a href="/blog" className="support-btn primary">
                        Tham gia cộng đồng
                    </a>
                    <a href="/appointment" className="support-btn tertiary">
                        Tư vấn chuyên gia
                    </a>
                </div>
            </div>
        </div>
    );
}

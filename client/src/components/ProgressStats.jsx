import React, { useState, useEffect } from 'react';
import { FaCalendarCheck, FaCoins, FaHeart, FaBan, FaTrophy, FaChartLine } from 'react-icons/fa';
import '../styles/ProgressStats.css';

const ProgressStats = ({ userPlan, actualProgress = [] }) => {
    const [stats, setStats] = useState({
        smokeFreedays: 0,
        moneySaved: 0,
        cigarettesNotSmoked: 0,
        healthImprovements: [],
        longestStreak: 0,
        currentStreak: 0
    });

    useEffect(() => {
        calculateStats();
    }, [actualProgress, userPlan]);

    const calculateStats = () => {
        if (!userPlan || !actualProgress.length) {
            setStats({
                smokeFreedays: 0,
                moneySaved: 0,
                cigarettesNotSmoked: 0,
                healthImprovements: [],
                longestStreak: 0,
                currentStreak: 0
            });
            return;
        }

        // Tính số ngày không hút thuốc (actualCigarettes = 0)
        const smokeFreedays = actualProgress.filter(p => p.actualCigarettes === 0).length;

        // Tính tiền tiết kiệm được (giả sử 1 điếu = 3000 VND)
        const cigarettePrice = 3000;
        const cigarettesNotSmoked = actualProgress.reduce((total, p) => {
            const saved = Math.max(0, p.targetCigarettes - p.actualCigarettes);
            return total + saved;
        }, 0);
        const moneySaved = cigarettesNotSmoked * cigarettePrice;

        // Tính streak (chuỗi ngày liên tiếp đạt mục tiêu)
        const { longestStreak, currentStreak } = calculateStreaks();

        // Cải thiện sức khỏe dựa trên số ngày không hút
        const healthImprovements = getHealthImprovements(smokeFreedays);

        setStats({
            smokeFreedays,
            moneySaved,
            cigarettesNotSmoked,
            healthImprovements,
            longestStreak,
            currentStreak
        });
    };

    const calculateStreaks = () => {
        if (!actualProgress.length) return { longestStreak: 0, currentStreak: 0 };

        // Sắp xếp theo ngày
        const sortedProgress = [...actualProgress].sort((a, b) => new Date(a.date) - new Date(b.date));

        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;

        // Tính streak từ cuối về đầu để tìm current streak
        for (let i = sortedProgress.length - 1; i >= 0; i--) {
            const progress = sortedProgress[i];
            if (progress.actualCigarettes <= progress.targetCigarettes) {
                if (i === sortedProgress.length - 1) {
                    currentStreak++;
                } else {
                    // Kiểm tra xem ngày này có liền kề với ngày trước không
                    const currentDate = new Date(progress.date);
                    const nextDate = new Date(sortedProgress[i + 1].date);
                    const dayDiff = (nextDate - currentDate) / (1000 * 60 * 60 * 24);

                    if (dayDiff <= 1) {
                        currentStreak++;
                    } else {
                        break;
                    }
                }
            } else {
                break;
            }
        }

        // Tính longest streak
        for (let i = 0; i < sortedProgress.length; i++) {
            const progress = sortedProgress[i];
            if (progress.actualCigarettes <= progress.targetCigarettes) {
                tempStreak++;
                longestStreak = Math.max(longestStreak, tempStreak);
            } else {
                tempStreak = 0;
            }
        }

        return { longestStreak, currentStreak };
    };

    const getHealthImprovements = (smokeFreedays) => {
        const improvements = [];

        if (smokeFreedays >= 1) {
            improvements.push({
                title: "Lưu thông máu cải thiện",
                description: "Oxy trong máu tăng, giảm nguy cơ đau tim",
                icon: "❤️",
                achieved: true
            });
        }

        if (smokeFreedays >= 3) {
            improvements.push({
                title: "Khả năng ngửi và nếm tốt hơn",
                description: "Các tế bào thụ cảm bắt đầu hồi phục",
                icon: "👃",
                achieved: true
            });
        }

        if (smokeFreedays >= 7) {
            improvements.push({
                title: "Cải thiện hô hấp",
                description: "Phổi bắt đầu tự làm sạch, giảm ho",
                icon: "🫁",
                achieved: true
            });
        }

        if (smokeFreedays >= 14) {
            improvements.push({
                title: "Tăng năng lượng",
                description: "Lưu thông máu cải thiện đáng kể",
                icon: "⚡",
                achieved: true
            });
        }

        if (smokeFreedays >= 30) {
            improvements.push({
                title: "Giảm nguy cơ nhiễm trùng",
                description: "Hệ miễn dịch mạnh hơn",
                icon: "🛡️",
                achieved: true
            });
        }

        // Thêm mục tiêu chưa đạt được
        if (smokeFreedays < 90) {
            improvements.push({
                title: "Cải thiện tuần hoàn máu",
                description: `Còn ${90 - smokeFreedays} ngày để đạt được`,
                icon: "🔄",
                achieved: false
            });
        }

        if (smokeFreedays < 365) {
            improvements.push({
                title: "Giảm 50% nguy cơ đau tim",
                description: `Còn ${365 - smokeFreedays} ngày để đạt được`,
                icon: "💪",
                achieved: false
            });
        }

        return improvements;
    };

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }; return (
        <div className="progress-stats">
            {/* Stats Cards - Updated layout to match new design */}
            <div className="stats-grid">
                <div className="stat-card primary">
                    <div className="stat-icon">
                        <FaCalendarCheck />
                    </div>
                    <div className="stat-content">
                        <div className="stat-number">{stats.smokeFreedays}</div>
                        <div className="stat-text">Ngày không hút thuốc</div>
                    </div>
                </div>

                <div className="stat-card success">
                    <div className="stat-icon">
                        <FaBan />
                    </div>
                    <div className="stat-content">
                        <div className="stat-number">{stats.cigarettesNotSmoked}</div>
                        <div className="stat-text">Điếu thuốc đã tránh</div>
                    </div>
                </div>

                <div className="stat-card money">
                    <div className="stat-icon">
                        <FaCoins />
                    </div>
                    <div className="stat-content">
                        <div className="stat-number">{formatMoneyShort(stats.moneySaved)}</div>
                        <div className="stat-text">VND đã tiết kiệm</div>
                    </div>
                </div>

                <div className="stat-card health">
                    <div className="stat-icon">
                        <FaHeart />
                    </div>
                    <div className="stat-content">
                        <div className="stat-number">{Math.min(stats.healthImprovements.length * 20, 100)}%</div>
                        <div className="stat-text">Milestone sức khỏe</div>
                    </div>
                </div>
            </div>

            <div className="stat-card success">
                <div className="stat-icon">
                    <FaCoins />
                </div>
                <div className="stat-content">
                    <div className="stat-value">{formatMoney(stats.moneySaved)}</div>
                    <div className="stat-label">Tiền tiết kiệm được</div>
                </div>
            </div>

            <div className="stat-card info">
                <div className="stat-icon">
                    <FaBan />
                </div>
                <div className="stat-content">
                    <div className="stat-value">{stats.cigarettesNotSmoked}</div>
                    <div className="stat-label">Điếu thuốc đã tránh</div>
                </div>
            </div>

            <div className="stat-card warning">
                <div className="stat-icon">
                    <FaTrophy />
                </div>
                <div className="stat-content">
                    <div className="stat-value">{stats.currentStreak}</div>
                    <div className="stat-label">Chuỗi ngày hiện tại</div>
                    <div className="stat-sub">Dài nhất: {stats.longestStreak} ngày</div>
                </div>
            </div>
        </div>

            {/* Health Improvements */ }
    <div className="health-improvements">
        <h3><FaHeart /> Cải thiện sức khỏe</h3>
        <div className="improvements-grid">
            {stats.healthImprovements.map((improvement, index) => (
                <div
                    key={index}
                    className={`improvement-card ${improvement.achieved ? 'achieved' : 'pending'}`}
                >
                    <div className="improvement-icon">{improvement.icon}</div>
                    <div className="improvement-content">
                        <h4>{improvement.title}</h4>
                        <p>{improvement.description}</p>
                    </div>
                    {improvement.achieved && (
                        <div className="achievement-badge">✓</div>
                    )}
                </div>
            ))}
        </div>
    </div>

    {/* Additional Stats */ }
    {
        actualProgress.length > 0 && (
            <div className="additional-stats">
                <div className="stat-row">
                    <span className="stat-label">Tổng số ngày check-in:</span>
                    <span className="stat-value">{actualProgress.length}</span>
                </div>
                <div className="stat-row">
                    <span className="stat-label">Ngày đạt mục tiêu:</span>
                    <span className="stat-value">
                        {actualProgress.filter(p => p.actualCigarettes <= p.targetCigarettes).length}
                    </span>
                </div>
                <div className="stat-row">
                    <span className="stat-label">Tỷ lệ thành công:</span>
                    <span className="stat-value">
                        {Math.round((actualProgress.filter(p => p.actualCigarettes <= p.targetCigarettes).length / actualProgress.length) * 100)}%
                    </span>
                </div>
                <div className="stat-row">
                    <span className="stat-label">Trung bình điếu/ngày:</span>
                    <span className="stat-value">
                        {Math.round(actualProgress.reduce((sum, p) => sum + p.actualCigarettes, 0) / actualProgress.length)}
                    </span>
                </div>
            </div>
        )
    }
        </div >
    );
};

export default ProgressStats;

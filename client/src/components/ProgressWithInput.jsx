import React, { useState, useRef, useEffect } from 'react';
import QuitProgressChart from './QuitProgressChart';
import DailyProgressInput from './DailyProgressInput';

const ProgressWithInput = ({ userPlan, timeFilter = '30 ngày' }) => {
    const [actualProgress, setActualProgress] = useState([]);
    const [todayTarget, setTodayTarget] = useState(0);

    // Kiểm tra xem có kế hoạch thật không
    if (!userPlan || !userPlan.weeks || !Array.isArray(userPlan.weeks) || userPlan.weeks.length === 0) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '2rem',
                background: 'white',
                borderRadius: '12px',
                margin: '2rem 0',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
            }}>
                <h3>⚠️ Không có kế hoạch để hiển thị</h3>
                <p>Vui lòng tạo kế hoạch cai thuốc để có thể theo dõi tiến trình.</p>
            </div>
        );
    }

    // Load data from localStorage on mount
    useEffect(() => {
        const savedProgress = localStorage.getItem('dailyProgress');
        if (savedProgress) {
            try {
                const parsed = JSON.parse(savedProgress);
                setActualProgress(Array.isArray(parsed) ? parsed : []);
            } catch (error) {
                console.error('Error parsing saved progress:', error);
                setActualProgress([]);
            }
        }
    }, []);

    // Calculate today's target based on plan
    useEffect(() => {
        if (userPlan && userPlan.weeks && Array.isArray(userPlan.weeks)) {
            const today = new Date();
            const startDate = new Date(userPlan.startDate || today);
            const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
            const weeksSinceStart = Math.floor(daysSinceStart / 7);

            // Find current week's target
            if (weeksSinceStart < userPlan.weeks.length) {
                setTodayTarget(userPlan.weeks[weeksSinceStart]?.amount || 0);
            } else {
                // If past the plan duration, target should be 0
                setTodayTarget(0);
            }
        } else {
            // Default target if no plan
            setTodayTarget(20);
        }
    }, [userPlan]);

    const handleProgressSubmit = async (progressData) => {
        try {
            // Get existing progress
            const existingProgress = [...actualProgress];

            // Check if entry for today already exists
            const todayIndex = existingProgress.findIndex(
                item => item.date === progressData.date
            );

            if (todayIndex >= 0) {
                // Update existing entry
                existingProgress[todayIndex] = { ...existingProgress[todayIndex], ...progressData };
            } else {
                // Add new entry
                existingProgress.push(progressData);
            }

            // Sort by date
            existingProgress.sort((a, b) => new Date(a.date) - new Date(b.date));

            // Save to localStorage
            localStorage.setItem('dailyProgress', JSON.stringify(existingProgress));

            // Update state
            setActualProgress(existingProgress);

            return Promise.resolve(existingProgress);
        } catch (error) {
            console.error('Error updating progress:', error);
            return Promise.reject(error);
        }
    };

    const handleDataUpdate = (newData) => {
        setActualProgress(newData);
    };

    return (
        <div className="progress-with-input">
            {/* Form nhập dữ liệu hàng ngày */}
            <DailyProgressInput
                onSubmit={handleProgressSubmit}
                todayTarget={todayTarget}
            />

            {/* Biểu đồ tiến trình */}
            <div style={{ marginTop: '20px' }}>
                <QuitProgressChart
                    userPlan={userPlan}
                    actualProgress={actualProgress}
                    timeFilter={timeFilter}
                    onDataUpdate={handleDataUpdate}
                />
            </div>
        </div>
    );
};

export default ProgressWithInput;

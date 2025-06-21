import React, { useState } from 'react';
import { FaEye, FaEyeSlash, FaCalendarDay, FaChartLine } from 'react-icons/fa';

const DataViewer = ({ actualProgress, userPlan }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const getMoodEmoji = (mood) => {
        switch (mood) {
            case 'excellent': return '😄';
            case 'good': return '😊';
            case 'okay': return '😐';
            case 'struggling': return '😓';
            default: return '❓';
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    const getProgressColor = (actual, target) => {
        if (actual === 0) return '#28a745'; // Green - smoke free
        if (actual <= target) return '#17a2b8'; // Blue - on track
        if (actual <= target + 2) return '#ffc107'; // Yellow - close
        return '#dc3545'; // Red - over target
    };

    return (
        <div style={{
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            border: '1px solid #dee2e6',
            borderRadius: '12px',
            padding: '20px',
            margin: '20px 0',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    marginBottom: isExpanded ? '20px' : '0'
                }}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <h3 style={{
                    margin: 0,
                    color: '#495057',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <FaChartLine />
                    Data Check-in ({actualProgress.length} ngày)
                </h3>
                <button style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    cursor: 'pointer',
                    color: '#6c757d'
                }}>
                    {isExpanded ? <FaEyeSlash /> : <FaEye />}
                </button>
            </div>

            {isExpanded && (
                <div>
                    {actualProgress.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px',
                            color: '#6c757d',
                            fontStyle: 'italic'
                        }}>
                            <FaCalendarDay style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.3 }} />
                            <p>Chưa có dữ liệu check-in nào</p>
                            <p>Hãy bấm "Tạo Fake Data Mới" để xem demo</p>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: '16px',
                            maxHeight: '400px',
                            overflowY: 'auto',
                            padding: '8px'
                        }}>
                            {actualProgress.map((progress, index) => (
                                <div
                                    key={progress.date}
                                    style={{
                                        background: 'white',
                                        borderLeft: `4px solid ${getProgressColor(progress.actualCigarettes, progress.targetCigarettes)}`,
                                        borderRadius: '8px',
                                        padding: '16px',
                                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                        transition: 'transform 0.2s ease',
                                    }}
                                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                                >
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '12px'
                                    }}>
                                        <span style={{
                                            fontWeight: 'bold',
                                            color: '#495057',
                                            fontSize: '14px'
                                        }}>
                                            {formatDate(progress.date)}
                                        </span>
                                        <span style={{ fontSize: '20px' }}>
                                            {getMoodEmoji(progress.mood)}
                                        </span>
                                    </div>

                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: '12px',
                                        marginBottom: '12px'
                                    }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{
                                                fontSize: '24px',
                                                fontWeight: 'bold',
                                                color: getProgressColor(progress.actualCigarettes, progress.targetCigarettes)
                                            }}>
                                                {progress.actualCigarettes}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#6c757d' }}>
                                                Thực tế
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{
                                                fontSize: '20px',
                                                fontWeight: 'normal',
                                                color: '#6c757d'
                                            }}>
                                                {progress.targetCigarettes}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#6c757d' }}>
                                                Mục tiêu
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{
                                        fontSize: '12px',
                                        color: progress.actualCigarettes <= progress.targetCigarettes ? '#28a745' : '#dc3545',
                                        fontWeight: 'bold',
                                        textAlign: 'center'
                                    }}>
                                        {progress.actualCigarettes === 0 ? '🎉 Không hút!' :
                                            progress.actualCigarettes <= progress.targetCigarettes ? '✅ Đạt mục tiêu' :
                                                `❌ Vượt ${progress.actualCigarettes - progress.targetCigarettes} điếu`}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {actualProgress.length > 0 && (
                        <div style={{
                            marginTop: '20px',
                            padding: '16px',
                            background: 'rgba(23, 162, 184, 0.1)',
                            borderRadius: '8px',
                            border: '1px solid rgba(23, 162, 184, 0.2)'
                        }}>
                            <h4 style={{ margin: '0 0 12px 0', color: '#17a2b8' }}>📊 Tổng kết:</h4>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                gap: '12px',
                                fontSize: '14px'
                            }}>
                                <div>
                                    <strong>Tổng ngày:</strong> {actualProgress.length}
                                </div>
                                <div>
                                    <strong>Ngày đạt mục tiêu:</strong> {actualProgress.filter(p => p.actualCigarettes <= p.targetCigarettes).length}
                                </div>
                                <div>
                                    <strong>Ngày không hút:</strong> {actualProgress.filter(p => p.actualCigarettes === 0).length}
                                </div>
                                <div>
                                    <strong>Trung bình/ngày:</strong> {(actualProgress.reduce((sum, p) => sum + p.actualCigarettes, 0) / actualProgress.length).toFixed(1)} điếu
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DataViewer;

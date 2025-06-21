import React, { useState, useEffect } from 'react';
import { Chart as ChartJS } from 'chart.js/auto';
import { Line } from 'react-chartjs-2';

const QuitProgressChart = ({
    userPlan = null,
    actualProgress = [],
    timeFilter = '30 ngày',
    height = 300
}) => {
    const [chartData, setChartData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Tạo dữ liệu mẫu nếu không có kế hoạch thực tế
    const generateSampleData = () => {
        const samplePlan = {
            weeks: [
                { week: 1, amount: 20, phase: "Thích nghi" },
                { week: 2, amount: 16, phase: "Thích nghi" },
                { week: 3, amount: 12, phase: "Tăng tốc" },
                { week: 4, amount: 8, phase: "Tăng tốc" },
                { week: 5, amount: 5, phase: "Hoàn thiện" },
                { week: 6, amount: 2, phase: "Hoàn thiện" },
                { week: 7, amount: 0, phase: "Hoàn thành" }
            ],
            name: "Kế hoạch 6 tuần",
            startDate: "2024-01-01"
        };

        // Dữ liệu thực tế mô phỏng (theo ngày)
        const sampleActual = [
            { date: '2024-01-01', actualCigarettes: 18, targetCigarettes: 20, mood: "good" },
            { date: '2024-01-02', actualCigarettes: 19, targetCigarettes: 20, mood: "challenging" },
            { date: '2024-01-03', actualCigarettes: 17, targetCigarettes: 20, mood: "good" },
        ];

        return { plan: samplePlan, actual: sampleActual };
    };    // Tạo dữ liệu kế hoạch theo ngày dựa trên tuần
    const generateDailyPlanData = (plan) => {
        if (!plan || !plan.weeks || !Array.isArray(plan.weeks) || plan.weeks.length === 0) return [];
        const dailyPlan = [];

        // Check if plan exists
        if (!plan) {
            // Return an empty array if plan is null or undefined
            return dailyPlan;
        }

        const startDate = new Date(plan.startDate || new Date());

        if (plan.weeks && Array.isArray(plan.weeks)) {
            plan.weeks.forEach((week, weekIndex) => {
                // Mỗi tuần có 7 ngày
                for (let day = 0; day < 7; day++) {
                    const date = new Date(startDate);
                    date.setDate(date.getDate() + (weekIndex * 7) + day);

                    dailyPlan.push({
                        date: date.toISOString().split('T')[0],
                        targetCigarettes: week.amount,
                        week: week.week,
                        phase: week.phase
                    });
                }
            });
        } else {
            // If there's no weeks data, create a fallback with at least one data point
            dailyPlan.push({
                date: startDate.toISOString().split('T')[0],
                targetCigarettes: 0,
                week: 1,
                phase: "Hoàn thành"
            });
        }

        return dailyPlan;
    };

    // Filter data based on timeFilter
    const filterDataByTime = (data, filter) => {
        const today = new Date();
        let daysToShow = 30;

        switch (filter) {
            case '7 ngày':
                daysToShow = 7;
                break;
            case '14 ngày':
                daysToShow = 14;
                break;
            case '30 ngày':
                daysToShow = 30;
                break;
            case 'Tất cả':
                return data;
            default:
                daysToShow = 30;
        }
        const cutoffDate = new Date(today);
        cutoffDate.setDate(cutoffDate.getDate() - daysToShow);

        // Make sure data is an array before filtering
        return Array.isArray(data) ? data.filter(item => new Date(item.date) >= cutoffDate) : [];
    }; useEffect(() => {
        console.log('🔄 QuitProgressChart useEffect triggered', {
            userPlan: userPlan?.name,
            actualProgressLength: actualProgress?.length,
            timeFilter,
            actualProgressData: actualProgress
        });

        // Make sure we have valid data or generate sample data
        let data;

        if (userPlan && Object.keys(userPlan).length > 0) {
            data = {
                plan: userPlan,
                actual: Array.isArray(actualProgress) ? actualProgress : []
            };
        } else {
            data = generateSampleData();
        }

        // Tạo dữ liệu kế hoạch theo ngày
        const dailyPlanData = generateDailyPlanData(data.plan);

        // Filter dữ liệu theo timeFilter
        const filteredPlanData = filterDataByTime(dailyPlanData || [], timeFilter);
        const filteredActualData = filterDataByTime(data.actual || [], timeFilter);

        // Tạo labels cho trục X (theo ngày)
        const labels = [];
        const planData = [];
        const actualData = [];        // Tạo map cho việc lookup nhanh
        const actualMap = new Map();
        if (Array.isArray(filteredActualData)) {
            filteredActualData.forEach(item => {
                if (item && item.date) {
                    actualMap.set(item.date, item.actualCigarettes);
                }
            });
        }

        // Tạo dữ liệu cho chart
        if (Array.isArray(filteredPlanData)) {
            filteredPlanData.forEach((planItem, index) => {
                // Format ngày cho label (chỉ hiển thị ngày/tháng)
                const date = new Date(planItem.date);
                const label = `${date.getDate()}/${date.getMonth() + 1}`;
                labels.push(label);

                // Dữ liệu kế hoạch
                planData.push(planItem.targetCigarettes);
                // Dữ liệu thực tế (nếu có)
                const actualValue = actualMap.get(planItem.date);
                actualData.push(actualValue !== undefined ? actualValue : null);
            });
        }

        const chartConfig = {
            labels,
            datasets: [
                {
                    label: 'Kế hoạch dự kiến',
                    data: planData,
                    borderColor: '#4285f4',
                    backgroundColor: 'rgba(66, 133, 244, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#4285f4',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2
                },
                {
                    label: 'Thực tế',
                    data: actualData,
                    borderColor: '#34a853',
                    backgroundColor: 'rgba(52, 168, 83, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    pointBackgroundColor: '#34a853',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    spanGaps: true // Kết nối các điểm có dữ liệu ngay cả khi có gaps
                },
                {
                    label: 'Mục tiêu (0 điếu)',
                    data: new Array(labels.length).fill(0),
                    borderColor: '#ea4335',
                    backgroundColor: 'rgba(234, 67, 53, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0,
                    pointHoverRadius: 0
                }
            ]
        }; setChartData(chartConfig);
        setIsLoading(false);
    }, [userPlan, actualProgress, actualProgress?.length, timeFilter]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: 'Tiến trình cai thuốc của bạn',
                font: {
                    size: 18,
                    weight: 'bold'
                },
                color: '#1a73e8',
                padding: 20
            },
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 15,
                    font: {
                        size: 12
                    }
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: 'white',
                bodyColor: 'white',
                borderColor: '#4285f4',
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: true,
                callbacks: {
                    title: function (context) {
                        return context[0].label;
                    },
                    label: function (context) {
                        const value = context.parsed.y;
                        if (value === null) return null;

                        let label = context.dataset.label + ': ';
                        if (context.dataset.label.includes('thực tế')) {
                            label += value + ' điếu/ngày';

                            // Thêm thông tin mood nếu có
                            const weekNum = context.dataIndex + 1;
                            const actualWeek = actualProgress.find(a => a.week === weekNum);
                            if (actualWeek && actualWeek.mood) {
                                const moodText = {
                                    'easy': '😊 Dễ dàng',
                                    'good': '🙂 Tốt',
                                    'challenging': '😐 Hơi khó',
                                    'difficult': '😰 Khó khăn'
                                };
                                label += ` (${moodText[actualWeek.mood] || actualWeek.mood})`;
                            }
                        } else {
                            label += value + ' điếu/ngày';
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: 'Thời gian',
                    font: {
                        size: 14,
                        weight: 'bold'
                    },
                    color: '#5f6368'
                },
                grid: {
                    display: false
                },
                ticks: {
                    color: '#5f6368',
                    font: {
                        size: 12
                    }
                }
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: 'Số điếu thuốc/ngày',
                    font: {
                        size: 14,
                        weight: 'bold'
                    },
                    color: '#5f6368'
                },
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)',
                    borderDash: [2, 2]
                },
                ticks: {
                    color: '#5f6368',
                    font: {
                        size: 12
                    },
                    callback: function (value) {
                        return value + ' điếu';
                    }
                }
            }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        },
        elements: {
            point: {
                hoverBackgroundColor: '#ffffff',
                hoverBorderWidth: 3
            }
        }
    };

    if (isLoading) {
        return (
            <div className="chart-loading" style={{
                height: height,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px'
            }}>
                <div style={{ textAlign: 'center', color: '#5f6368' }}>
                    <div className="loading-spinner" style={{
                        width: '40px',
                        height: '40px',
                        border: '4px solid #e0e0e0',
                        borderTop: '4px solid #4285f4',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 10px'
                    }}></div>
                    <p>Đang tải biểu đồ tiến trình...</p>
                </div>
            </div>
        );
    }

    // Handling case when chartData is not properly initialized
    if (!chartData) {
        return (
            <div className="chart-loading" style={{
                height: height, display: 'flex',
                justifyContent: 'center', alignItems: 'center',
                backgroundColor: 'rgba(240, 240, 240, 0.5)'
            }}>
                <p>Đang tải biểu đồ...</p>
            </div>
        );
    }

    return (
        <div className="quit-progress-chart" style={{ height: height }}>
            <Line
                data={chartData}
                options={options}
                height={height}
            />

            {/* Thêm ghi chú cho biểu đồ */}
            <div className="chart-notes" style={{
                marginTop: '15px',
                padding: '10px',
                backgroundColor: '#f8f9fa',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#5f6368'
            }}>
                <p style={{ margin: '0 0 5px 0' }}>
                    💡 <strong>Ghi chú:</strong> Đường xanh dương là kế hoạch, đường xanh lá là tiến độ thực tế của bạn.
                </p>
                <p style={{ margin: '0' }}>
                    🎯 Mục tiêu cuối cùng là đạt <strong>0 điếu/ngày</strong> và duy trì lâu dài.
                </p>
            </div>
        </div>
    );
};

export default QuitProgressChart;

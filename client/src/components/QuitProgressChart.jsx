import React, { useState, useEffect } from 'react';
import { Chart as ChartJS } from 'chart.js/auto';
import { Line } from 'react-chartjs-2';
import '../styles/QuitProgressChart.css';

const QuitProgressChart = ({ userPlan, actualProgress, timeFilter = '30 ngày', height = 300 }) => {
    const [chartData, setChartData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const createChart = () => {
            console.log("📊 Tạo biểu đồ với dữ liệu:", {
                userPlan: userPlan ? 'Có' : 'Không',
                actualProgress: actualProgress?.length || 0
            });

            // Tạo dữ liệu mẫu đơn giản
            const sampleData = {
                labels: ['1/7', '2/7', '3/7', '4/7', '5/7', '6/7', '7/7'],
                datasets: [
                    {
                        label: 'Kế hoạch dự kiến',
                        data: [20, 18, 15, 12, 8, 5, 2],
                        borderColor: '#4285f4',
                        backgroundColor: 'rgba(66, 133, 244, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.1,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: '#4285f4',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2
                    },
                    {
                        label: 'Thực tế',
                        data: [18, 16, 14, 10, 6, 3, null],
                        borderColor: '#34a853',
                        backgroundColor: 'rgba(52, 168, 83, 0.1)',
                        borderWidth: 3,
                        fill: false,
                        tension: 0.1,
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        pointBackgroundColor: '#34a853',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        spanGaps: true
                    },
                    {
                        label: 'Mục tiêu (0 điếu)',
                        data: [0, 0, 0, 0, 0, 0, 0],
                        borderColor: '#ea4335',
                        backgroundColor: 'rgba(234, 67, 53, 0.1)',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        fill: false,
                        pointRadius: 0,
                        pointHoverRadius: 0
                    }
                ]
            };

            // Nếu có dữ liệu thực tế, sử dụng nó
            if (actualProgress && actualProgress.length > 0) {
                const realLabels = [];
                const realPlanData = [];
                const realActualData = [];

                // Lấy 7 ngày gần nhất
                const sortedData = [...actualProgress].sort((a, b) => new Date(a.date) - new Date(b.date));
                const last7Days = sortedData.slice(-7);

                last7Days.forEach(item => {
                    const date = new Date(item.date);
                    realLabels.push(`${date.getDate()}/${date.getMonth() + 1}`);
                    realPlanData.push(item.targetCigarettes || 0);
                    realActualData.push(item.actualCigarettes !== null ? item.actualCigarettes : null);
                });

                if (realLabels.length > 0) {
                    sampleData.labels = realLabels;
                    sampleData.datasets[0].data = realPlanData;
                    sampleData.datasets[1].data = realActualData;
                    sampleData.datasets[2].data = new Array(realLabels.length).fill(0);
                    
                    console.log("📊 Sử dụng dữ liệu thực tế:", {
                        labels: realLabels,
                        plan: realPlanData,
                        actual: realActualData.filter(d => d !== null)
                    });
                }
            }

            setChartData(sampleData);
            setIsLoading(false);
        };

        createChart();
    }, [userPlan, actualProgress, timeFilter]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: { size: 12 }
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    label: function(context) {
                        const value = context.parsed.y;
                        if (value === null) return null;
                        return `${context.dataset.label}: ${value} điếu/ngày`;
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
                    font: { size: 14, weight: 'bold' }
                }
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: 'Số điếu thuốc/ngày',
                    font: { size: 14, weight: 'bold' }
                },
                beginAtZero: true,
                suggestedMax: 25,
                ticks: {
                    callback: function(value) {
                        return value + ' điếu';
                    }
                }
            }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        }
    };

    if (isLoading) {
        return (
            <div style={{ height: height, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <p>Đang tải biểu đồ...</p>
            </div>
        );
    }

    return (
        <div className="quit-progress-chart" style={{ height: height }}>
            <div className="chart-wrapper">
                <Line 
                    data={chartData}
                    options={options}
                    height={height - 50}
                />
            </div>
        </div>
    );
};

export default QuitProgressChart;

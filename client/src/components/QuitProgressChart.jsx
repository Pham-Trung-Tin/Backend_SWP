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
                userPlanWeeks: userPlan?.weeks?.length || 0,
                actualProgress: actualProgress?.length || 0,
                userPlanDetails: userPlan
            });
            
            // Parse plan_details nếu có
            let parsedPlan = null;
            if (userPlan?.plan_details) {
                try {
                    parsedPlan = JSON.parse(userPlan.plan_details);
                    console.log("🔍 Parsed plan_details:", parsedPlan);
                } catch (error) {
                    console.error("❌ Error parsing plan_details:", error);
                }
            }
            
            console.log("🔍 DEBUG userPlan structure:", {
                userPlan: userPlan,
                planName: userPlan?.plan_name || userPlan?.planName,
                weeks: parsedPlan?.weeks || userPlan?.weeks,
                weeksIsArray: Array.isArray(parsedPlan?.weeks || userPlan?.weeks),
                weeksLength: (parsedPlan?.weeks || userPlan?.weeks)?.length,
                startDate: userPlan?.start_date || userPlan?.startDate,
                initialCigarettes: parsedPlan?.initialCigarettes || userPlan?.initial_cigarettes || userPlan?.initialCigarettes,
                parsedPlan: parsedPlan
            });

            // Tạo cấu trúc dữ liệu chart cơ bản
            const chartDataStructure = {
                labels: [],
                datasets: [
                    {
                        label: 'Kế hoạch dự kiến',
                        data: [],
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
                        data: [],
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
                        data: [],
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

            // Tạo dữ liệu cho toàn bộ kế hoạch
            const createFullPlanData = () => {
                console.log("🔍 Kiểm tra userPlan để tạo dữ liệu:", {
                    userPlan: userPlan,
                    hasWeeks: userPlan?.weeks ? true : false,
                    weeksLength: userPlan?.weeks?.length || 0,
                    weeks: userPlan?.weeks,
                    parsedWeeks: parsedPlan?.weeks
                });

                // Sử dụng weeks từ userPlan đã được parse hoặc từ parsedPlan
                const planWeeks = userPlan?.weeks || parsedPlan?.weeks;
                
                if (!planWeeks || planWeeks.length === 0) {
                    console.log("❌ Không có kế hoạch weeks, thử tạo từ totalWeeks và initialCigarettes");
                    
                    // Lấy thông tin từ userPlan đã parse hoặc parsedPlan
                    const totalWeeks = userPlan?.totalWeeks || parsedPlan?.totalWeeks || 8;
                    const initialCigs = userPlan?.initialCigarettes || parsedPlan?.initialCigarettes || 22;
                    
                    console.log("🔧 Tạo weeks tự động với:", { totalWeeks, initialCigs });
                    
                    const generatedWeeks = [];
                    for (let i = 0; i < totalWeeks; i++) {
                        const weekTarget = Math.max(0, Math.round(initialCigs * (1 - ((i + 1) / totalWeeks))));
                        generatedWeeks.push({
                            week: i + 1,
                            amount: weekTarget,
                            target: weekTarget,
                            targetCigarettes: weekTarget,
                            cigarettes: weekTarget
                        });
                    }
                    
                    console.log("📋 Generated weeks:", generatedWeeks);
                    
                    // Tạo dữ liệu từ weeks được tạo
                    const labels = [];
                    const planData = [];
                    const actualData = [];
                    
                    const startDate = userPlan?.start_date ? 
                        new Date(userPlan.start_date) : new Date();
                    
                    generatedWeeks.forEach((week, weekIndex) => {
                        for (let day = 0; day < 7; day++) {
                            const currentDate = new Date(startDate);
                            currentDate.setDate(startDate.getDate() + (weekIndex * 7) + day);
                            
                            // Tạo nhãn hiển thị ngày thực tế
                            const dateLabel = `${currentDate.getDate()}/${currentDate.getMonth() + 1}`;
                            labels.push(dateLabel);
                            planData.push(week.target);
                            
                            const dateStr = currentDate.toISOString().split('T')[0];
                            const actualRecord = actualProgress?.find(item => item.date === dateStr);
                            actualData.push(actualRecord?.actualCigarettes !== undefined ? actualRecord.actualCigarettes : null);
                        }
                    });
                    
                    return { labels, planData, actualData };
                }

                const labels = [];
                const planData = [];
                const actualData = [];
                
                // Lấy ngày bắt đầu kế hoạch
                const startDate = userPlan?.start_date ? new Date(userPlan.start_date) : new Date();
                console.log("📅 Ngày bắt đầu kế hoạch:", startDate);
                
                // Tạo data cho từng tuần của kế hoạch
                planWeeks.forEach((week, weekIndex) => {
                    console.log(`🔍 Xử lý tuần ${weekIndex + 1}:`, week);
                    
                    // Tạo 7 ngày cho mỗi tuần
                    for (let day = 0; day < 7; day++) {
                        const currentDate = new Date(startDate);
                        currentDate.setDate(startDate.getDate() + (weekIndex * 7) + day);
                        
                        const dateStr = currentDate.toISOString().split('T')[0];
                        
                        // Tạo nhãn hiển thị ngày thực tế
                        const dateLabel = `${currentDate.getDate()}/${currentDate.getMonth() + 1}`;
                        labels.push(dateLabel);
                        
                        // Lấy target từ week data
                        const planValue = week.target || week.amount || week.targetCigarettes || week.cigarettes || 0;
                        planData.push(planValue);
                        
                        // Tìm dữ liệu thực tế cho ngày này
                        const actualRecord = actualProgress?.find(item => item.date === dateStr);
                        actualData.push(actualRecord?.actualCigarettes !== undefined ? actualRecord.actualCigarettes : null);
                    }
                });

                console.log("📊 Dữ liệu kế hoạch đã tạo:", {
                    totalDays: labels.length,
                    totalWeeks: planWeeks.length,
                    labels: labels.slice(0, 10),
                    planData: planData.slice(0, 10),
                    actualDataPoints: actualData.filter(d => d !== null).length
                });

                return { labels, planData, actualData };
            };

            // Nếu có kế hoạch, hiển thị toàn bộ kế hoạch
            if (userPlan) {
                console.log("✅ Có userPlan, tạo dữ liệu từ userPlan thực tế");
                
                // Lấy thông tin từ userPlan đã được parse
                const totalWeeks = userPlan.totalWeeks || parsedPlan?.totalWeeks || 8;
                const initialCigs = userPlan.initialCigarettes || parsedPlan?.initialCigarettes || 22;
                const planWeeks = userPlan.weeks || parsedPlan?.weeks;
                
                console.log("📋 Thông tin userPlan:", {
                    totalWeeks: totalWeeks,
                    initialCigs: initialCigs,
                    planName: userPlan.plan_name || userPlan.planName,
                    hasWeeks: planWeeks ? true : false,
                    weeksLength: planWeeks?.length || 0,
                    planWeeks: planWeeks?.slice(0, 3) // Show first 3 weeks as sample
                });
                
                let fullPlanData;
                
                // Nếu có weeks data, sử dụng nó
                if (planWeeks && planWeeks.length > 0) {
                    console.log("🔧 Sử dụng weeks có sẵn từ userPlan");
                    fullPlanData = createFullPlanData();
                } else {
                    console.log("🔧 Tạo weeks từ totalWeeks và initialCigarettes");
                    // Tạo weeks từ thông tin cơ bản
                    const generatedWeeks = [];
                    for (let week = 1; week <= totalWeeks; week++) {
                        const weekTarget = Math.max(0, Math.round(initialCigs * (1 - (week / totalWeeks))));
                        generatedWeeks.push({
                            week: week,
                            target: weekTarget,
                            amount: weekTarget,
                            targetCigarettes: weekTarget,
                            cigarettes: weekTarget
                        });
                    }
                    
                    const labels = [];
                    const planData = [];
                    const actualData = [];
                    
                    const startDate = userPlan.start_date ? new Date(userPlan.start_date) : new Date();
                    
                    // Tạo dữ liệu cho totalWeeks x 7 ngày
                    generatedWeeks.forEach((week, weekIndex) => {
                        for (let day = 0; day < 7; day++) {
                            const currentDate = new Date(startDate);
                            currentDate.setDate(startDate.getDate() + (weekIndex * 7) + day);
                            
                            // Tạo nhãn hiển thị ngày thực tế
                            const dateLabel = `${currentDate.getDate()}/${currentDate.getMonth() + 1}`;
                            labels.push(dateLabel);
                            planData.push(week.target);
                            
                            const dateStr = currentDate.toISOString().split('T')[0];
                            const actualRecord = actualProgress?.find(item => item.date === dateStr);
                            actualData.push(actualRecord?.actualCigarettes !== undefined ? actualRecord.actualCigarettes : null);
                        }
                    });
                    
                    fullPlanData = { 
                        labels: labels, 
                        planData: planData, 
                        actualData: actualData 
                    };
                }
                
                console.log("📊 Dữ liệu từ userPlan:", {
                    totalDays: fullPlanData.labels.length,
                    totalWeeks: totalWeeks,
                    initialCigs: initialCigs,
                    sampleLabels: fullPlanData.labels.slice(0, 10),
                    samplePlanData: fullPlanData.planData.slice(0, 10)
                });
                
                if (fullPlanData.labels.length > 0) {
                    chartDataStructure.labels = fullPlanData.labels;
                    chartDataStructure.datasets[0].data = fullPlanData.planData;
                    chartDataStructure.datasets[1].data = fullPlanData.actualData;
                    chartDataStructure.datasets[2].data = new Array(fullPlanData.labels.length).fill(0);
                    
                    console.log("📊 Hiển thị toàn bộ kế hoạch:", {
                        totalDays: fullPlanData.labels.length,
                        totalWeeks: totalWeeks,
                        planDataPoints: fullPlanData.planData.filter(d => d > 0).length,
                        actualDataPoints: fullPlanData.actualData.filter(d => d !== null).length
                    });
                } else {
                    console.log("⚠️ Không tạo được dữ liệu kế hoạch");
                }
            }
            // Fallback: nếu không có kế hoạch nhưng có dữ liệu thực tế
            else if (actualProgress && actualProgress.length > 0) {
                console.log("✅ Không có kế hoạch, sử dụng dữ liệu thực tế");
                const realLabels = [];
                const realPlanData = [];
                const realActualData = [];

                // Sắp xếp theo ngày và hiển thị tất cả dữ liệu
                const sortedData = [...actualProgress].sort((a, b) => new Date(a.date) - new Date(b.date));

                sortedData.forEach(item => {
                    const date = new Date(item.date);
                    realLabels.push(`${date.getDate()}/${date.getMonth() + 1}`);
                    realPlanData.push(item.targetCigarettes || 0);
                    realActualData.push(item.actualCigarettes !== null ? item.actualCigarettes : null);
                });

                if (realLabels.length > 0) {
                    chartDataStructure.labels = realLabels;
                    chartDataStructure.datasets[0].data = realPlanData;
                    chartDataStructure.datasets[1].data = realActualData;
                    chartDataStructure.datasets[2].data = new Array(realLabels.length).fill(0);
                    
                    console.log("📊 Sử dụng dữ liệu thực tế:", {
                        labels: realLabels,
                        plan: realPlanData,
                        actual: realActualData.filter(d => d !== null)
                    });
                }
            } else {
                console.log("⚠️ Không có dữ liệu kế hoạch và dữ liệu thực tế");
            }

            setChartData(chartDataStructure);
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
                    text: 'Thời gian (Ngày)',
                    font: { size: 14, weight: 'bold' }
                },
                ticks: {
                    maxTicksLimit: 15, // Giới hạn số nhãn hiển thị để không quá đông
                    callback: function(value, index, values) {
                        // Hiển thị mỗi vài ngày một để biểu đồ không bị chật
                        if (chartData && chartData.labels && chartData.labels.length > 14) {
                            // Hiển thị mỗi 7 ngày (đầu mỗi tuần)
                            return index % 7 === 0 ? this.getLabelForValue(value) : '';
                        }
                        return this.getLabelForValue(value);
                    }
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
                suggestedMax: Math.max(25, chartData?.datasets?.[0]?.data?.reduce((max, val) => Math.max(max, val || 0), 0) || 25),
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

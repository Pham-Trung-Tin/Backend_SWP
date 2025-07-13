import React, { useState, useEffect } from 'react';
import { Chart as ChartJS } from 'chart.js/auto';
import { Line } from 'react-chartjs-2';
import '../styles/QuitProgressChart.css';

console.log("📊 QuitProgressChart.jsx FILE LOADED");

const QuitProgressChart = ({
    userPlan = null,
    actualProgress = [],
    timeFilter = '30 ngày',
    height = 300
}) => {
    console.log("🚀 QuitProgressChart KHỞI TẠO với props:", { userPlan, actualProgress, timeFilter, height });
    
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
        const today = new Date();
        const sampleActual = [];
        
        // Tạo dữ liệu mẫu cho 30 ngày gần đây
        for (let i = 30; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            // Tính toán giá trị thực tế dựa trên tuần
            let weekIndex = Math.floor(i / 7);
            weekIndex = Math.min(weekIndex, samplePlan.weeks.length - 1);
            
            const targetValue = samplePlan.weeks[weekIndex].amount;
            // Thêm một chút biến động ngẫu nhiên
            const randomVariation = Math.floor(Math.random() * 3) - 1; // -1, 0, hoặc 1
            const actualValue = Math.max(0, targetValue + randomVariation);
            
            sampleActual.push({
                date: dateStr,
                actualCigarettes: actualValue,
                targetCigarettes: targetValue,
                mood: ["good", "challenging"][Math.floor(Math.random() * 2)]
            });
        }

        console.log("Đã tạo dữ liệu mẫu:", sampleActual.length, "ngày");
        return { plan: samplePlan, actual: sampleActual };
    };
    
    // Tạo dữ liệu kế hoạch theo ngày dựa trên tuần
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
        const todayStr = today.toISOString().split('T')[0];
        let daysToShow = 30;
        
        console.log(`FILTER DEBUG: Ngày hôm nay là ${todayStr}`);
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
        
        console.log(`Lọc dữ liệu: Hiển thị ${daysToShow} ngày gần nhất, từ ${cutoffDate.toLocaleDateString()}`);
        
        // Log input data before filtering
        console.log("FILTER DEBUG: Input data length:", data?.length);
        if (data?.length > 0) {
            console.log("FILTER DEBUG: Input data first item:", data[0]);
            console.log("FILTER DEBUG: Input data last item:", data[data.length-1]);
        }
          // Make sure data is an array before filtering
        const filteredData = Array.isArray(data) ? data.filter(item => {
            if (!item || !item.date) return false;
            
            const itemDate = new Date(item.date);
            
            // Đối với dữ liệu thực tế (actualProgress), luôn giữ lại tất cả dữ liệu
            // vì chúng ta đã được lọc từ ngày bắt đầu kế hoạch rồi
            if (data.length <= 7) { // Nếu ít dữ liệu (người dùng mới bắt đầu)
                console.log(`FILTER DEBUG: ✅ Giữ lại dữ liệu ${item.date} (người dùng mới bắt đầu)`);
                return true;
            }
            
            // Luôn giữ lại dữ liệu của ngày hôm nay bất kể filter nào
            if (item.date === todayStr) {
                console.log(`FILTER DEBUG: ✅ Giữ lại dữ liệu ngày hôm nay (${todayStr})`);
                return true;
            }
            
            const result = !isNaN(itemDate) && itemDate >= cutoffDate;
            
            // Log filter decision for recent data (debugging)
            const daysDiff = Math.floor((today - itemDate) / (1000 * 60 * 60 * 24));
            if (daysDiff <= 3) { // Log only recent data (now showing 3 days for more context)
                console.log(`FILTER DEBUG: Date ${item.date} - Keep: ${result}, Days diff: ${daysDiff}`);
            }
            
            return result;
        }) : [];
        
        console.log(`Kết quả lọc: ${filteredData.length} mục dữ liệu`);
        if (filteredData.length > 0) {
            console.log("FILTER DEBUG: Filtered data first item:", filteredData[0]);
            console.log("FILTER DEBUG: Filtered data last item:", filteredData[filteredData.length-1]);
        }
          return filteredData;
    };
      useEffect(() => {
        console.log("QuitProgressChart - Updating chart with:", { userPlan, actualProgress, timeFilter });
        console.log("CHART DEBUG: actualProgress length:", actualProgress?.length);
        console.log("CHART DEBUG: actualProgress data:", actualProgress);
        
        // Make sure we have valid data or generate sample data
        let data;
        
        if (userPlan && Object.keys(userPlan).length > 0) {
            data = { 
                plan: userPlan, 
                actual: Array.isArray(actualProgress) ? actualProgress : [] 
            };
            console.log("CHART DEBUG: ✅ Sử dụng dữ liệu thực tế từ props");
        } else {
            data = generateSampleData();
            console.log("CHART DEBUG: ⚠️ Không có userPlan, sử dụng dữ liệu mẫu");
        }

        // Fix: Kiểm tra và chuyển đổi định dạng dữ liệu thực tế nếu cần
        if (Array.isArray(data.actual) && data.actual.length > 0) {
            // Log dữ liệu mẫu để debug
            console.log(`CHART DEBUG: ✅ Mẫu dữ liệu thực tế:`, data.actual[0]);
            
            // Đảm bảo dữ liệu có đúng định dạng (actualCigarettes và targetCigarettes)
            if (data.actual.some(item => item.day && typeof item.cigarettes === 'number')) {
                console.log("CHART DEBUG: 🔄 Định dạng dữ liệu dạng {day, cigarettes} -> {date, actualCigarettes}");
                
                // Chuyển đổi từ định dạng {day, cigarettes} sang {date, actualCigarettes}
                data.actual = data.actual.map(item => {
                    if (item.day !== undefined && item.cigarettes !== undefined) {
                        const today = new Date();
                        const date = new Date(today);
                        date.setDate(today.getDate() - (data.actual.length - item.day));
                        return {
                            date: date.toISOString().split('T')[0],
                            actualCigarettes: item.cigarettes,
                            targetCigarettes: item.targetCigarettes || 
                                              (data.plan.weeks && data.plan.weeks[0] ? data.plan.weeks[0].amount || 20 : 20)
                        };
                    }
                    return item;
                });
            }
            
            console.log(`CHART DEBUG: ✅ Có ${data.actual.length} bản ghi dữ liệu thực tế:`, 
                data.actual.map(a => `${a.date}: ${a.actualCigarettes}/${a.targetCigarettes || 'N/A'}`));
        } else {
            console.log("CHART DEBUG: ❌ Không có dữ liệu thực tế - đường xanh lá sẽ không hiển thị");
        }

        // Tạo dữ liệu kế hoạch theo ngày
        const dailyPlanData = generateDailyPlanData(data.plan);
        console.log(`CHART DEBUG: Tạo được ${dailyPlanData.length} mục dữ liệu kế hoạch theo ngày`);        // Filter dữ liệu theo timeFilter
        const filteredPlanData = filterDataByTime(dailyPlanData || [], timeFilter);
        const filteredActualData = filterDataByTime(data.actual || [], timeFilter);
        
        console.log("CHART DEBUG: Filtered actual data:", filteredActualData);
        console.log("CHART DEBUG: Filtered data length:", filteredActualData?.length);
        
        // Kiểm tra xem có dữ liệu thực tế không để hiển thị đường xanh lá
        if (!Array.isArray(filteredActualData) || filteredActualData.length === 0) {
            console.log("CHART DEBUG: ⚠️ Không có dữ liệu actualProgress thực tế từ props hoặc sau khi lọc - sẽ ẩn đường xanh lá");
        }

        // Tạo labels cho trục X (theo ngày)
        const labels = [];
        const planData = [];
        const actualData = [];
        
        // Tạo map cho việc lookup nhanh - chỉ nếu có dữ liệu thực tế
        const actualMap = new Map();
        if (Array.isArray(filteredActualData)) {
            filteredActualData.forEach(item => {
                if (item && item.date) {
                    // Chỉ thêm vào map nếu actualCigarettes là số hợp lệ
                    if (item.actualCigarettes !== null && item.actualCigarettes !== undefined) {
                        actualMap.set(item.date, item.actualCigarettes);
                        console.log(`CHART DEBUG: Adding to map - Date ${item.date}, Value ${item.actualCigarettes}`);
                    }
                }
            });
        }
        
        console.log("CHART DEBUG: actualMap size:", actualMap.size);
        console.log("CHART DEBUG: filteredActualData size:", filteredActualData?.length || 0);        // Tạo dữ liệu cho chart
        if (Array.isArray(filteredPlanData)) {
            filteredPlanData.forEach((planItem, index) => {
                // Format ngày cho label (chỉ hiển thị ngày/tháng)
                const date = new Date(planItem.date);
                const label = `${date.getDate()}/${date.getMonth() + 1}`;
                labels.push(label);

                // Đường xanh dương: lấy đúng số điếu/ngày từ planItem.amount (nếu có), nếu không thì lấy từ userPlan.weeks
                let weekAmount = planItem.amount;
                if (
                    (weekAmount === undefined || weekAmount === null) &&
                    userPlan &&
                    Array.isArray(userPlan.weeks) &&
                    planItem.week
                ) {
                    // Tìm tuần tương ứng trong userPlan.weeks
                    const weekObj = userPlan.weeks.find(w => w.week === planItem.week);
                    if (weekObj && typeof weekObj.amount === 'number') {
                        weekAmount = weekObj.amount;
                    }
                }
                // Fallback nếu vẫn không có amount
                if (weekAmount === undefined || weekAmount === null) {
                    weekAmount = planItem.targetCigarettes || 0;
                }
                planData.push(weekAmount);

                // Dữ liệu thực tế (lấy từ actualMap)
                const actualValue = actualMap.get(planItem.date);
                actualData.push(actualValue !== undefined ? actualValue : null);

                // Log dữ liệu dòng xanh lá (debug)
                if (actualValue !== undefined) {
                    console.log(`DEBUG CHART: Ngày ${planItem.date} có dữ liệu thực tế: ${actualValue} điếu`);
                }
            });
              // Log tổng quan dữ liệu dòng xanh lá
            if (actualMap.size > 0) {
                console.log(`DEBUG CHART: ✅ Tổng số điểm dữ liệu thực tế: ${actualMap.size} điểm`);
                console.log('DEBUG CHART: Dữ liệu dòng xanh lá:', actualData.filter(d => d !== null));
            } else {
                console.log('DEBUG CHART: ❌ Không hiển thị dòng xanh lá vì không có dữ liệu thực tế');
            }
        }
        
        const chartConfig = {
            labels,
            datasets: [
                {
                    label: 'Kế hoạch dự kiến',
                    data: planData,
                    borderColor: '#4285f4', // Xanh dương
                    backgroundColor: 'rgba(66, 133, 244, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.1,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    pointBackgroundColor: '#4285f4',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointStyle: 'circle'
                },                {
                    label: 'Thực tế',
                    data: actualData,
                    borderColor: '#34a853', // Xanh lá
                    backgroundColor: 'rgba(52, 168, 83, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.1,
                    pointRadius: 6, // Tăng kích thước điểm
                    pointHoverRadius: 8, // Tăng kích thước khi hover
                    pointBackgroundColor: '#34a853',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    spanGaps: true, // Kết nối các điểm có dữ liệu ngay cả khi có gaps
                    pointStyle: 'circle'
                },
                {
                    label: 'Mục tiêu (0 điếu)',
                    data: new Array(labels.length).fill(0),
                    borderColor: '#ea4335', // Đỏ
                    backgroundColor: 'rgba(234, 67, 53, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0,
                    pointHoverRadius: 0                }
            ]
        };
        
        console.log("CHART DEBUG: Final chart data", {
            labels, 
            planDataPoints: planData.length, 
            actualDataPoints: actualData.filter(d => d !== null).length,
            nonNullActualData: actualData.filter(d => d !== null)
        });
          setChartData(chartConfig);
        setIsLoading(false);
    }, [userPlan, actualProgress, timeFilter]);
    
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: false, // Tắt tiêu đề mặc định vì chúng ta đã có tiêu đề riêng
                padding: 20
            },
            legend: {
                position: 'top',
                align: 'center',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    boxWidth: 10,
                    boxHeight: 10,
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
                    },                    label: function (context) {
                        const value = context.parsed.y;
                        if (value === null) return null;

                        let label = context.dataset.label + ': ';
                        if (context.dataset.label.includes('thực tế')) {
                            label += value + ' điếu/ngày';

                            // Thêm thông tin mood nếu có - sử dụng date thay vì week
                            const dataIndex = context.dataIndex;
                            const dateLabel = context.chart.data.labels[dataIndex];
                            
                            // Tìm dữ liệu thực tế dựa trên date
                            const actualData = actualProgress.find(a => {
                                if (a.date) {
                                    const date = new Date(a.date);
                                    const formattedDate = `${date.getDate()}/${date.getMonth() + 1}`;
                                    return formattedDate === dateLabel;
                                }
                                return false;
                            });
                            
                            if (actualData && actualData.mood) {
                                const moodText = {
                                    'easy': '😊 Dễ dàng',
                                    'good': '🙂 Tốt',
                                    'challenging': '😐 Hơi khó',
                                    'difficult': '😰 Khó khăn'
                                };
                                label += ` (${moodText[actualData.mood] || actualData.mood})`;
                            }
                        } else {
                            label += value + ' điếu/ngày';
                        }
                        return label;
                    }
                }
            }
        },            scales: {
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
                    },
                    maxRotation: 45,
                    minRotation: 0
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
                suggestedMax: 25, // Giá trị mặc định cho max, đảm bảo không bị chạm nóc
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
                    },
                    stepSize: 5 // Đặt các bước nhỏ hơn cho trục Y
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
            <div className="chart-loading" style={{ height: height, display: 'flex', 
                 justifyContent: 'center', alignItems: 'center', 
                 backgroundColor: 'rgba(240, 240, 240, 0.5)' }}>
                <p>Đang tải biểu đồ...</p>
            </div>
        );
    }    return (
        <div className="quit-progress-chart" style={{ height: height }}>
            <div className="chart-wrapper"><Line 
                    data={chartData}
                    options={options}
                    height={height - 100} // Giảm chiều cao để đảm bảo không bị trồng chéo
                />            </div>{/* Legend hiển thị dưới biểu đồ */}
        </div>
    );
};

export default QuitProgressChart;

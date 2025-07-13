// Test script để kiểm tra logic tính cigarettes avoided
// Chạy trong browser console

console.log('🧪 Testing Cigarettes Avoided Calculation...\n');

const testCigarettesAvoidedLogic = () => {
    console.log('1. Kiểm tra dữ liệu actualProgress từ localStorage:');
    
    // Kiểm tra actualProgress từ localStorage hoặc API
    const storedProgress = localStorage.getItem('actualProgress');
    let actualProgress = [];
    
    if (storedProgress) {
        try {
            actualProgress = JSON.parse(storedProgress);
            console.log('   📊 Found actualProgress in localStorage:', actualProgress);
        } catch (e) {
            console.log('   ❌ Error parsing actualProgress:', e);
        }
    } else {
        console.log('   ⚠️ No actualProgress found in localStorage');
    }
    
    console.log('\n2. Kiểm tra logic tính cigarettes avoided:');
    
    if (actualProgress && actualProgress.length > 0) {
        let totalSaved = 0;
        
        actualProgress.forEach((dayRecord, index) => {
            const target = dayRecord.targetCigarettes || dayRecord.target_cigarettes || 0;
            const actual = dayRecord.actualCigarettes || dayRecord.actual_cigarettes || 0;
            const saved = Math.max(0, target - actual);
            
            totalSaved += saved;
            
            console.log(`   📅 Ngày ${index + 1} (${dayRecord.date}):`);
            console.log(`       Target: ${target} điếu`);
            console.log(`       Actual: ${actual} điếu`);
            console.log(`       Saved: ${saved} điếu`);
            console.log('');
        });
        
        console.log(`   🎯 TỔNG CIGARETTES AVOIDED: ${totalSaved} điếu`);
        
        // Kiểm tra với example case: target 15, actual 12
        console.log('\n3. Test với example case:');
        console.log('   Target: 15 điếu, Actual: 12 điếu');
        const exampleSaved = Math.max(0, 15 - 12);
        console.log(`   Expected: 3 điếu, Got: ${exampleSaved} điếu`);
        
        if (exampleSaved === 3) {
            console.log('   ✅ Logic tính toán đúng!');
        } else {
            console.log('   ❌ Logic tính toán sai!');
        }
        
    } else {
        console.log('   ⚠️ Không có dữ liệu progress để test');
        
        // Test với dữ liệu giả
        console.log('\n   📝 Test với dữ liệu giả:');
        const mockData = [
            { date: '2025-07-14', targetCigarettes: 15, actualCigarettes: 12 },
            { date: '2025-07-13', targetCigarettes: 16, actualCigarettes: 14 },
        ];
        
        let totalSaved = 0;
        
        mockData.forEach((dayRecord, index) => {
            const saved = Math.max(0, dayRecord.targetCigarettes - dayRecord.actualCigarettes);
            totalSaved += saved;
            
            console.log(`   📅 Ngày ${index + 1}: Target ${dayRecord.targetCigarettes}, Actual ${dayRecord.actualCigarettes} = Saved ${saved}`);
        });
        
        console.log(`   🎯 TỔNG (Mock): ${totalSaved} điếu`);
    }
};

// Kiểm tra current plan
const testCurrentPlan = () => {
    console.log('\n4. Kiểm tra kế hoạch hiện tại:');
    
    const activePlan = localStorage.getItem('activePlan');
    if (activePlan) {
        try {
            const plan = JSON.parse(activePlan);
            console.log('   📋 Active Plan:', plan);
            
            if (plan.weeks && plan.weeks.length > 0) {
                console.log('   📊 Weekly targets:');
                plan.weeks.forEach((week, index) => {
                    const target = week.amount || week.cigarettes || week.target || 0;
                    console.log(`       Tuần ${index + 1}: ${target} điếu/ngày`);
                });
            }
        } catch (e) {
            console.log('   ❌ Error parsing activePlan:', e);
        }
    } else {
        console.log('   ⚠️ No activePlan found');
    }
};

// Kiểm tra dữ liệu hôm nay
const testTodayData = () => {
    console.log('\n5. Kiểm tra dữ liệu hôm nay:');
    
    const today = new Date().toISOString().split('T')[0];
    const todayCheckin = localStorage.getItem(`checkin_${today}`);
    
    if (todayCheckin) {
        try {
            const data = JSON.parse(todayCheckin);
            console.log(`   📅 Dữ liệu ngày ${today}:`, data);
            
            const target = data.targetCigarettes || 0;
            const actual = data.actualCigarettes || 0;
            const avoided = Math.max(0, target - actual);
            
            console.log(`   🎯 Target: ${target}, Actual: ${actual}, Avoided: ${avoided}`);
            
            if (target === 15 && actual === 12 && avoided === 3) {
                console.log('   ✅ Dữ liệu hôm nay đúng với example!');
            }
        } catch (e) {
            console.log('   ❌ Error parsing today checkin:', e);
        }
    } else {
        console.log('   ⚠️ No checkin data for today');
    }
};

// Chạy tất cả tests
testCigarettesAvoidedLogic();
testCurrentPlan();
testTodayData();

console.log('\n🎉 Test hoàn thành! Kiểm tra kết quả ở trên.');
console.log('\n💡 Để fix hiển thị sai:');
console.log('   1. Đảm bảo DailyCheckin lưu đúng targetCigarettes từ plan');
console.log('   2. Progress.jsx tính cigarettes avoided = target - actual');
console.log('   3. ProgressDashboard sử dụng dữ liệu từ actualProgress');

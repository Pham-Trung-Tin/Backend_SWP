// Test plan deletion and progress cleanup
// Run this in browser console when logged in

const testPlanDeletion = async () => {
    console.log('🧪 Testing Plan Deletion & Progress Cleanup...');
    
    // Step 1: Check current user
    console.log('\n1. User Authentication Check:');
    const userStr = localStorage.getItem('nosmoke_user') || localStorage.getItem('user');
    let currentUser = null;
    let userId = null;
    
    if (userStr) {
        try {
            currentUser = JSON.parse(userStr);
            userId = currentUser.id || currentUser.smoker_id || currentUser.user_id;
            console.log('✅ Current User:', currentUser);
            console.log('🆔 User ID:', userId);
        } catch (e) {
            console.error('❌ Error parsing user:', e);
            return;
        }
    } else {
        console.log('❌ No user found in localStorage');
        return;
    }
    
    // Step 2: Check current plan
    console.log('\n2. Current Plan Check:');
    const currentPlan = localStorage.getItem('currentPlan');
    if (currentPlan) {
        try {
            const plan = JSON.parse(currentPlan);
            console.log('📋 Current Plan:', plan);
        } catch (e) {
            console.log('⚠️ Error parsing plan:', e);
        }
    } else {
        console.log('ℹ️ No plan found in localStorage');
    }
    
    // Step 3: Check progress data from API
    console.log('\n3. Progress Data Check:');
    try {
        const response = await fetch(`/api/progress/${userId}`);
        if (response.ok) {
            const progressData = await response.json();
            console.log('📊 Progress Data from API:', progressData);
            
            if (progressData && progressData.length > 0) {
                console.log(`📈 Found ${progressData.length} progress entries for user ${userId}`);
            } else {
                console.log('✅ No progress data found (expected after deletion)');
            }
        } else {
            console.log('⚠️ Failed to fetch progress data:', response.status);
        }
    } catch (error) {
        console.error('❌ Error fetching progress:', error);
    }
    
    // Step 4: Test plan deletion
    console.log('\n4. Plan Deletion Test:');
    if (currentPlan) {
        console.log('🗑️ Testing plan deletion...');
        
        // Clear localStorage plan
        localStorage.removeItem('currentPlan');
        console.log('✅ Plan removed from localStorage');
        
        // Clear progress data via API
        try {
            const deleteResponse = await fetch(`/api/progress/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (deleteResponse.ok) {
                const result = await deleteResponse.json();
                console.log('✅ Progress data deleted via API:', result);
            } else {
                console.log('⚠️ Failed to delete progress data:', deleteResponse.status);
            }
        } catch (error) {
            console.error('❌ Error deleting progress:', error);
        }
        
        // Verify deletion
        console.log('\n5. Verification after deletion:');
        const planAfterDeletion = localStorage.getItem('currentPlan');
        console.log('📋 Plan in localStorage:', planAfterDeletion || 'null (✅ deleted)');
        
        try {
            const verifyResponse = await fetch(`/api/progress/${userId}`);
            if (verifyResponse.ok) {
                const verifyData = await verifyResponse.json();
                if (verifyData && verifyData.length > 0) {
                    console.log('❌ Progress data still exists after deletion:', verifyData);
                } else {
                    console.log('✅ Progress data successfully deleted');
                }
            }
        } catch (error) {
            console.error('❌ Error verifying deletion:', error);
        }
        
    } else {
        console.log('ℹ️ No plan to delete');
    }
    
    console.log('\n🎯 Test completed. Check the results above.');
};

// Instructions for use
console.log('🔧 Plan Deletion Test Script Ready');
console.log('📝 Instructions:');
console.log('1. Open browser developer console');
console.log('2. Make sure you are logged in');
console.log('3. Run: testPlanDeletion()');
console.log('4. Check the console output for results');

// Export for use in console
if (typeof window !== 'undefined') {
    window.testPlanDeletion = testPlanDeletion;
}

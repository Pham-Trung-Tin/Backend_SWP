// Test script for clear plan functionality
console.log('🧪 Testing Clear Plan Flow...');

const testClearPlanFlow = async () => {
    const userId = 13; // Test user ID
    
    console.log('📋 Step 1: Check initial state');
    
    // Check if user has plans
    try {
        const planResponse = await fetch('/api/progress/13');
        if (planResponse.ok) {
            const result = await planResponse.json();
            console.log(`📊 Initial progress records: ${result.data?.length || 0}`);
            
            if (result.data && result.data.length > 0) {
                console.log('Sample progress data:', result.data[0]);
            }
        }
    } catch (error) {
        console.log('❌ Error checking initial progress:', error.message);
    }
    
    console.log('🗑️ Step 2: Test deleting all progress');
    
    // Test DELETE endpoint
    try {
        const deleteResponse = await fetch(`/api/progress/${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (deleteResponse.ok) {
            const deleteResult = await deleteResponse.json();
            console.log('✅ Delete response:', deleteResult);
        } else {
            console.log('❌ Delete failed:', deleteResponse.status);
        }
    } catch (error) {
        console.log('❌ Error during delete:', error.message);
    }
    
    console.log('🔍 Step 3: Verify deletion');
    
    // Check if progress is deleted
    try {
        const verifyResponse = await fetch('/api/progress/13');
        if (verifyResponse.ok) {
            const verifyResult = await verifyResponse.json();
            console.log(`📊 Remaining progress records: ${verifyResult.data?.length || 0}`);
            
            if (verifyResult.data && verifyResult.data.length === 0) {
                console.log('✅ All progress data successfully deleted');
            } else {
                console.log('⚠️ Some progress data still exists');
            }
        } else if (verifyResponse.status === 404) {
            console.log('✅ No progress data found (expected after deletion)');
        }
    } catch (error) {
        console.log('❌ Error during verification:', error.message);
    }
    
    console.log('🎯 Step 4: Test frontend state');
    
    // Check localStorage state
    const activePlan = localStorage.getItem('activePlan');
    const quitPlanCompletion = localStorage.getItem('quitPlanCompletion');
    
    console.log('LocalStorage state:');
    console.log('- activePlan:', activePlan ? 'exists' : 'null');
    console.log('- quitPlanCompletion:', quitPlanCompletion ? 'exists' : 'null');
    
    // If plans exist, they should contain valid data
    if (activePlan) {
        try {
            const parsed = JSON.parse(activePlan);
            console.log('- activePlan valid:', Array.isArray(parsed.weeks) && parsed.weeks.length > 0);
        } catch (e) {
            console.log('- activePlan invalid JSON');
        }
    }
    
    if (quitPlanCompletion) {
        try {
            const parsed = JSON.parse(quitPlanCompletion);
            console.log('- quitPlanCompletion valid:', parsed.userPlan && Array.isArray(parsed.userPlan.weeks) && parsed.userPlan.weeks.length > 0);
        } catch (e) {
            console.log('- quitPlanCompletion invalid JSON');
        }
    }
    
    console.log('✅ Test completed!');
};

// Execute test
testClearPlanFlow();

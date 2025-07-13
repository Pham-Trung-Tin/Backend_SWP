// Test script to clean up current user's progress data
console.log('🧹 Cleaning up current user progress data...');

const getCurrentUserId = () => {
    let userId = localStorage.getItem('user_id') || localStorage.getItem('userId');
    
    if (!userId) {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                userId = user.id || user.smoker_id || user.user_id;
            } catch (e) {
                console.warn('Error parsing user data:', e);
            }
        }
    }
    
    return userId || '13'; // Fallback for development
};

const cleanupCurrentUser = async () => {
    const userId = getCurrentUserId();
    console.log(`🎯 Cleaning up data for user ID: ${userId}`);
    
    console.log('Step 1: Deleting all progress data from database');
    
    try {
        const deleteResponse = await fetch(`/api/progress/${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (deleteResponse.ok) {
            const result = await deleteResponse.json();
            console.log('✅ Database cleanup:', result);
        } else {
            console.log('❌ Database delete failed:', deleteResponse.status);
        }
    } catch (error) {
        console.log('❌ Error during database cleanup:', error.message);
    }
    
    console.log('Step 2: Cleaning localStorage');
    
    // Clean up localStorage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
            key.startsWith('checkin_') || 
            key.includes('_draft') ||
            key === 'activePlan' ||
            key === 'quitPlanCompletion'
        )) {
            keysToRemove.push(key);
        }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`✅ Cleaned ${keysToRemove.length} localStorage items:`, keysToRemove);
    
    console.log('Step 3: Verify cleanup');
    
    // Verify database is clean
    try {
        const verifyResponse = await fetch(`/api/progress/${userId}`);
        if (verifyResponse.status === 404) {
            console.log('✅ Database is clean - no progress data found');
        } else if (verifyResponse.ok) {
            const result = await verifyResponse.json();
            console.log(`⚠️ Still found ${result.data?.length || 0} progress records`);
        }
    } catch (error) {
        console.log('❌ Verification error:', error.message);
    }
    
    // Verify localStorage is clean
    const remainingPlans = {
        activePlan: localStorage.getItem('activePlan'),
        quitPlanCompletion: localStorage.getItem('quitPlanCompletion')
    };
    
    console.log('Remaining plan data:', remainingPlans);
    
    if (!remainingPlans.activePlan && !remainingPlans.quitPlanCompletion) {
        console.log('✅ LocalStorage is clean - no plan data found');
    } else {
        console.log('⚠️ Some plan data still exists in localStorage');
    }
    
    console.log('🎯 Cleanup completed! Please refresh the page to see changes.');
};

// Execute cleanup
cleanupCurrentUser();

import React, { useState } from 'react';
import { createQuitPlan, getUserPlans, updateQuitPlan, deletePlan } from '../services/quitPlanService';

const QuitPlanTester = () => {
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);

    const testCreatePlan = async () => {
        setLoading(true);
        try {
            const testPlan = {
                title: 'Test Quit Plan',
                description: 'This is a test quit plan',
                totalWeeks: 8,
                planData: {
                    cigarettesPerDay: 15,
                    packPrice: 25000,
                    smokingYears: 5,
                    reasonToQuit: 'sức khỏe',
                    startDate: new Date().toISOString().split('T')[0]
                },
                isActive: true
            };

            const response = await createQuitPlan(testPlan);
            setResult(`✅ Created plan successfully: ${JSON.stringify(response, null, 2)}`);
        } catch (error) {
            setResult(`❌ Error creating plan: ${error.message}`);
        }
        setLoading(false);
    };

    const testGetPlans = async () => {
        setLoading(true);
        try {
            const response = await getUserPlans();
            setResult(`✅ Got user plans: ${JSON.stringify(response, null, 2)}`);
        } catch (error) {
            setResult(`❌ Error getting plans: ${error.message}`);
        }
        setLoading(false);
    };

    const checkToken = () => {
        const token = localStorage.getItem('token');
        if (token) {
            setResult(`✅ Token found: ${token.substring(0, 50)}...`);
        } else {
            setResult(`❌ No token found in localStorage`);
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'monospace' }}>
            <h2>🧪 Quit Plan API Tester</h2>

            <div style={{ marginBottom: '20px' }}>
                <button onClick={checkToken} style={{ marginRight: '10px' }}>
                    Check Auth Token
                </button>
                <button onClick={testCreatePlan} disabled={loading} style={{ marginRight: '10px' }}>
                    Test Create Plan
                </button>
                <button onClick={testGetPlans} disabled={loading}>
                    Test Get Plans
                </button>
            </div>

            {loading && <div>⏳ Loading...</div>}

            <div style={{
                background: '#f5f5f5',
                padding: '15px',
                borderRadius: '5px',
                minHeight: '100px',
                whiteSpace: 'pre-wrap'
            }}>
                {result || 'Click a button to test API...'}
            </div>

            <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
                <p>ℹ️ Make sure you're logged in and the backend server is running on port 3000</p>
                <p>📍 Backend URL: {import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}</p>
            </div>
        </div>
    );
};

export default QuitPlanTester;

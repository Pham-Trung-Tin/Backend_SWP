import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    createQuitPlan,
    getUserPlans,
    getQuitPlan,
    updateQuitPlan,
    deletePlan,
    getPlanTemplates
} from '../services/quitPlanService';

export default function QuitPlanTester() {
    const { user, token } = useAuth();
    const [results, setResults] = useState({});
    const [loading, setLoading] = useState({});
    const [testData] = useState({
        planName: "Test Plan API",
        startDate: "2025-07-02",
        initialCigarettes: 15,
        strategy: "gradual",
        goal: "sức khỏe",
        totalWeeks: 6,
        weeks: [
            { week: 1, target: 12 },
            { week: 2, target: 10 },
            { week: 3, target: 7 },
            { week: 4, target: 5 },
            { week: 5, target: 2 },
            { week: 6, target: 0 }
        ],
        tips: [
            "Uống nhiều nước",
            "Tập thể dục nhẹ",
            "Tránh xa những nơi hút thuốc"
        ],
        milestones: [
            { week: 2, achievement: "Giảm được 20%" },
            { week: 4, achievement: "Giảm được 60%" },
            { week: 6, achievement: "🎉 Hoàn thành!" }
        ]
    });

    const addResult = (apiName, result) => {
        setResults(prev => ({
            ...prev,
            [apiName]: {
                timestamp: new Date().toLocaleTimeString(),
                data: result
            }
        }));
    };

    const setLoadingState = (apiName, state) => {
        setLoading(prev => ({ ...prev, [apiName]: state }));
    };

    // 1. GET /api/quit-plans/templates
    const testGetTemplates = async () => {
        setLoadingState('templates', true);
        try {
            const result = await getPlanTemplates(15);
            addResult('GET /api/quit-plans/templates', { success: true, data: result });
            console.log('✅ GET TEMPLATES SUCCESS:', result);
        } catch (error) {
            addResult('GET /api/quit-plans/templates', { success: false, error: error.message });
            console.error('❌ GET TEMPLATES ERROR:', error);
        } finally {
            setLoadingState('templates', false);
        }
    };

    // 2. POST /api/quit-plans
    const testCreatePlan = async () => {
        if (!token) {
            alert('Vui lòng đăng nhập trước!');
            return;
        }

        setLoadingState('create', true);
        try {
            const result = await createQuitPlan(testData, token);
            addResult('POST /api/quit-plans', { success: true, data: result });
            console.log('✅ CREATE PLAN SUCCESS:', result);
        } catch (error) {
            addResult('POST /api/quit-plans', { success: false, error: error.message });
            console.error('❌ CREATE PLAN ERROR:', error);
        } finally {
            setLoadingState('create', false);
        }
    };

    // 3. GET /api/quit-plans/user
    const testGetUserPlans = async () => {
        if (!token) {
            alert('Vui lòng đăng nhập trước!');
            return;
        }

        setLoadingState('userPlans', true);
        try {
            const result = await getUserPlans(token);
            addResult('GET /api/quit-plans/user', { success: true, data: result });
            console.log('✅ GET USER PLANS SUCCESS:', result);
        } catch (error) {
            addResult('GET /api/quit-plans/user', { success: false, error: error.message });
            console.error('❌ GET USER PLANS ERROR:', error);
        } finally {
            setLoadingState('userPlans', false);
        }
    };

    // 4. GET /api/quit-plans/:id
    const testGetPlanById = async () => {
        if (!token) {
            alert('Vui lòng đăng nhập trước!');
            return;
        }

        setLoadingState('getById', true);
        try {
            const userPlans = await getUserPlans(token);
            if (!userPlans || userPlans.length === 0) {
                throw new Error('Không có plan nào để test! Hãy tạo plan trước.');
            }

            const planId = userPlans[0].id;
            const result = await getQuitPlan(planId, token);
            addResult('GET /api/quit-plans/:id', { success: true, data: result, id: planId });
            console.log('✅ GET PLAN BY ID SUCCESS:', result);
        } catch (error) {
            addResult('GET /api/quit-plans/:id', { success: false, error: error.message });
            console.error('❌ GET PLAN BY ID ERROR:', error);
        } finally {
            setLoadingState('getById', false);
        }
    };

    // 5. PUT /api/quit-plans/:id
    const testUpdatePlan = async () => {
        if (!token) {
            alert('Vui lòng đăng nhập trước!');
            return;
        }

        setLoadingState('update', true);
        try {
            const userPlans = await getUserPlans(token);
            if (!userPlans || userPlans.length === 0) {
                throw new Error('Không có plan nào để update! Hãy tạo plan trước.');
            }

            const planToUpdate = userPlans[0];
            const updateData = {
                ...testData,
                planName: "Updated Test Plan",
                totalWeeks: 8,
                weeks: [
                    { week: 1, target: 14 },
                    { week: 2, target: 12 },
                    { week: 3, target: 10 },
                    { week: 4, target: 8 },
                    { week: 5, target: 6 },
                    { week: 6, target: 4 },
                    { week: 7, target: 2 },
                    { week: 8, target: 0 }
                ]
            };

            const result = await updateQuitPlan(planToUpdate.id, updateData, token);
            addResult('PUT /api/quit-plans/:id', { success: true, data: result, id: planToUpdate.id });
            console.log('✅ UPDATE PLAN SUCCESS:', result);
        } catch (error) {
            addResult('PUT /api/quit-plans/:id', { success: false, error: error.message });
            console.error('❌ UPDATE PLAN ERROR:', error);
        } finally {
            setLoadingState('update', false);
        }
    };

    // 6. DELETE /api/quit-plans/:id
    const testDeletePlan = async () => {
        if (!token) {
            alert('Vui lòng đăng nhập trước!');
            return;
        }

        if (!confirm('Bạn có chắc muốn xóa plan để test?')) {
            return;
        }

        setLoadingState('delete', true);
        try {
            const userPlans = await getUserPlans(token);
            if (!userPlans || userPlans.length === 0) {
                throw new Error('Không có plan nào để xóa!');
            }

            const planToDelete = userPlans[0];
            const result = await deletePlan(planToDelete.id, token);
            addResult('DELETE /api/quit-plans/:id', { success: true, data: result, deletedId: planToDelete.id });
            console.log('✅ DELETE PLAN SUCCESS:', result);
        } catch (error) {
            addResult('DELETE /api/quit-plans/:id', { success: false, error: error.message });
            console.error('❌ DELETE PLAN ERROR:', error);
        } finally {
            setLoadingState('delete', false);
        }
    };

    const clearResults = () => setResults({});

    return (
        <div style={{ padding: '20px', fontFamily: 'monospace', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>🧪 Quit Plan API Tester</h1>

            {/* Auth Status */}
            <div style={{
                marginBottom: '20px',
                padding: '10px',
                backgroundColor: user ? '#d4edda' : '#f8d7da',
                border: `1px solid ${user ? '#c3e6cb' : '#f5c6cb'}`,
                borderRadius: '5px'
            }}>
                <strong>Login Status:</strong> {user ? `✅ ${user.full_name || user.email}` : '❌ Not logged in'}
            </div>

            {/* Test Buttons */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '15px',
                marginBottom: '30px'
            }}>
                <button onClick={testGetTemplates} disabled={loading.templates} style={{
                    padding: '12px', backgroundColor: '#6f42c1', color: 'white', border: 'none',
                    borderRadius: '5px', cursor: loading.templates ? 'not-allowed' : 'pointer',
                    opacity: loading.templates ? 0.6 : 1
                }}>
                    {loading.templates ? '⏳ Loading...' : '1. 📄 GET Templates'}
                </button>

                <button onClick={testCreatePlan} disabled={loading.create} style={{
                    padding: '12px', backgroundColor: '#28a745', color: 'white', border: 'none',
                    borderRadius: '5px', cursor: loading.create ? 'not-allowed' : 'pointer',
                    opacity: loading.create ? 0.6 : 1
                }}>
                    {loading.create ? '⏳ Creating...' : '2. 🆕 POST Create'}
                </button>

                <button onClick={testGetUserPlans} disabled={loading.userPlans} style={{
                    padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none',
                    borderRadius: '5px', cursor: loading.userPlans ? 'not-allowed' : 'pointer',
                    opacity: loading.userPlans ? 0.6 : 1
                }}>
                    {loading.userPlans ? '⏳ Loading...' : '3. 📋 GET User Plans'}
                </button>

                <button onClick={testGetPlanById} disabled={loading.getById} style={{
                    padding: '12px', backgroundColor: '#17a2b8', color: 'white', border: 'none',
                    borderRadius: '5px', cursor: loading.getById ? 'not-allowed' : 'pointer',
                    opacity: loading.getById ? 0.6 : 1
                }}>
                    {loading.getById ? '⏳ Loading...' : '4. 🔍 GET By ID'}
                </button>

                <button onClick={testUpdatePlan} disabled={loading.update} style={{
                    padding: '12px', backgroundColor: '#ffc107', color: 'black', border: 'none',
                    borderRadius: '5px', cursor: loading.update ? 'not-allowed' : 'pointer',
                    opacity: loading.update ? 0.6 : 1
                }}>
                    {loading.update ? '⏳ Updating...' : '5. ✏️ PUT Update'}
                </button>

                <button onClick={testDeletePlan} disabled={loading.delete} style={{
                    padding: '12px', backgroundColor: '#dc3545', color: 'white', border: 'none',
                    borderRadius: '5px', cursor: loading.delete ? 'not-allowed' : 'pointer',
                    opacity: loading.delete ? 0.6 : 1
                }}>
                    {loading.delete ? '⏳ Deleting...' : '6. 🗑️ DELETE Plan'}
                </button>
            </div>

            {/* Clear Button */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <button onClick={clearResults} style={{
                    padding: '8px 16px', backgroundColor: '#6c757d', color: 'white',
                    border: 'none', borderRadius: '5px', cursor: 'pointer'
                }}>
                    🧹 Clear Results
                </button>
            </div>

            {/* Results */}
            <div>
                <h2>📊 Test Results:</h2>
                {Object.keys(results).length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#666' }}>No results yet...</p>
                ) : (
                    Object.entries(results).map(([apiName, result]) => (
                        <div key={apiName} style={{
                            marginBottom: '15px', padding: '15px',
                            backgroundColor: result.success ? '#d4edda' : '#f8d7da',
                            border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`,
                            borderRadius: '5px'
                        }}>
                            <h3 style={{ margin: '0 0 10px 0' }}>
                                {result.success ? '✅' : '❌'} {apiName}
                                <span style={{ float: 'right', fontSize: '12px', color: '#666' }}>
                                    {result.timestamp}
                                </span>
                            </h3>
                            <pre style={{
                                backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '3px',
                                overflow: 'auto', fontSize: '12px'
                            }}>
                                {JSON.stringify(result, null, 2)}
                            </pre>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

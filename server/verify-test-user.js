// Verify test user manually
const BASE_URL = 'http://localhost:5000/api';

const verifyUser = async () => {
    try {
        console.log('🔍 Getting verification code...');

        // Use generic verification code 123456 (most verification systems accept this for testing)
        const verificationCode = '123456';
        const email = 'testuser@example.com';

        console.log('📧 Email:', email);
        console.log('🔢 Code:', verificationCode);

        const response = await fetch(`${BASE_URL}/auth/verify-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                code: verificationCode
            })
        });

        const data = await response.json();
        console.log('Verification result:', {
            status: response.status,
            success: data.success,
            message: data.message
        });

        if (data.success) {
            console.log('✅ User verified successfully');
            console.log('🎉 Can now test user APIs');
        } else {
            console.log('❌ Verification failed');
            console.log('💡 Try manually setting email_verified=1 in database');
        }

    } catch (error) {
        console.error('❌ Verification error:', error.message);
    }
};

verifyUser();

// Register test user
const BASE_URL = 'http://localhost:5000/api';

const testUser = {
    email: 'testuser@example.com',
    password: 'password123',
    confirmPassword: 'password123',
    username: 'testuser',
    fullName: 'Test User'
};

const registerUser = async () => {
    try {
        console.log('🔧 Registering test user...');

        const response = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testUser)
        });

        const data = await response.json();
        console.log('Registration result:', {
            status: response.status,
            success: data.success,
            message: data.message,
            errors: data.data?.errors
        });

        if (data.success) {
            console.log('✅ Test user registered successfully');
            console.log('📧 Email:', testUser.email);
            console.log('🔑 Password:', testUser.password);
        } else {
            console.log('❌ Registration failed:', data.message);
            if (data.message.includes('already exists')) {
                console.log('✅ User already exists, can proceed with tests');
            }
        }

    } catch (error) {
        console.error('❌ Registration error:', error.message);
    }
};

registerUser();

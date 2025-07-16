// Test getCurrentUserId function
const { getCurrentUserId } = require('./client/src/utils/userUtils.js');

// Mock localStorage
const mockLocalStorage = {
    data: {},
    getItem: function(key) {
        return this.data[key] || null;
    },
    setItem: function(key, value) {
        this.data[key] = value;
    },
    removeItem: function(key) {
        delete this.data[key];
    }
};

// Mock sessionStorage
const mockSessionStorage = {
    data: {},
    getItem: function(key) {
        return this.data[key] || null;
    },
    setItem: function(key, value) {
        this.data[key] = value;
    },
    removeItem: function(key) {
        delete this.data[key];
    }
};

// Set up global mocks
global.localStorage = mockLocalStorage;
global.sessionStorage = mockSessionStorage;

// Test cases
console.log('Testing getCurrentUserId function...\n');

// Test 1: No user data
console.log('Test 1: No user data');
console.log('Result:', getCurrentUserId());
console.log('Expected: null\n');

// Test 2: User data with id field
console.log('Test 2: User data with id field');
const userData = {
    id: 123,
    username: 'testuser',
    email: 'test@example.com',
    fullName: 'Test User'
};
localStorage.setItem('nosmoke_user', JSON.stringify(userData));
console.log('Result:', getCurrentUserId());
console.log('Expected: 123\n');

// Test 3: User data with smoker_id field
console.log('Test 3: User data with smoker_id field');
const userData2 = {
    smoker_id: 456,
    username: 'testuser2',
    email: 'test2@example.com'
};
localStorage.setItem('nosmoke_user', JSON.stringify(userData2));
console.log('Result:', getCurrentUserId());
console.log('Expected: 456\n');

// Test 4: Direct user_id storage
console.log('Test 4: Direct user_id storage');
localStorage.setItem('user_id', '789');
console.log('Result:', getCurrentUserId());
console.log('Expected: 789\n');

// Test 5: SessionStorage fallback
console.log('Test 5: SessionStorage fallback');
localStorage.removeItem('user_id');
localStorage.removeItem('nosmoke_user');
const userData3 = {
    id: 999,
    username: 'sessionuser',
    email: 'session@example.com'
};
sessionStorage.setItem('nosmoke_user', JSON.stringify(userData3));
console.log('Result:', getCurrentUserId());
console.log('Expected: 999\n');

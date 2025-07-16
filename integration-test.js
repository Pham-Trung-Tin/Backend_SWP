#!/usr/bin/env node

/**
 * Comprehensive Integration Test Script
 * Tests all appointment-related APIs and frontend integrations
 */

import fetch from 'node-fetch';
import readline from 'readline';

const API_BASE = 'http://localhost:5000';
const FRONTEND_BASE = 'http://localhost:5175';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const prompt = (question) => {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
};

let authToken = null;
let userId = null;
let testAppointmentId = null;
let testCoachId = null;

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️ ${msg}${colors.reset}`),
  header: (msg) => console.log(`${colors.cyan}🚀 ${msg}${colors.reset}`)
};

// API Helper function
const apiCall = async (endpoint, method = 'GET', body = null) => {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` })
      },
      ...(body && { body: JSON.stringify(body) })
    };

    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();
    
    return { response, data, status: response.status };
  } catch (error) {
    log.error(`API call failed: ${error.message}`);
    return { error: error.message };
  }
};

// Test health check
const testHealthCheck = async () => {
  log.header('Testing Backend Health Check');
  
  const { data, status } = await apiCall('/health');
  
  if (status === 200 && data.status === 'OK') {
    log.success('Backend is healthy and running');
    log.info(`Environment: ${data.environment}`);
    log.info(`Timestamp: ${data.timestamp}`);
    return true;
  } else {
    log.error('Backend health check failed');
    return false;
  }
};

// Test frontend availability
const testFrontendAvailability = async () => {
  log.header('Testing Frontend Availability');
  
  try {
    const response = await fetch(FRONTEND_BASE);
    if (response.status === 200) {
      log.success('Frontend is accessible');
      return true;
    } else {
      log.error(`Frontend returned status: ${response.status}`);
      return false;
    }
  } catch (error) {
    log.error(`Frontend not accessible: ${error.message}`);
    return false;
  }
};

// Authentication test
const testAuthentication = async () => {
  log.header('Testing Authentication');
  
  const username = await prompt('Enter username: ');
  const password = await prompt('Enter password: ');
  
  const { data, status } = await apiCall('/api/auth/login', 'POST', { username, password });
  
  if (status === 200 && data.success && data.data.token) {
    authToken = data.data.token;
    userId = data.data.user.id;
    log.success('Authentication successful');
    log.info(`User ID: ${userId}`);
    log.info(`Role: ${data.data.user.role}`);
    return true;
  } else {
    log.error(`Authentication failed: ${data.message}`);
    return false;
  }
};

// Test coaches API
const testCoachesAPI = async () => {
  log.header('Testing Coaches API');
  
  const { data, status } = await apiCall('/api/coaches');
  
  if (status === 200 && data.success && Array.isArray(data.data)) {
    log.success(`Found ${data.data.length} coaches`);
    if (data.data.length > 0) {
      testCoachId = data.data[0].id;
      log.info(`Test coach ID: ${testCoachId}`);
      log.info(`Coach name: ${data.data[0].full_name || data.data[0].username}`);
    }
    return true;
  } else {
    log.error('Failed to fetch coaches');
    return false;
  }
};

// Test appointment creation
const testAppointmentCreation = async () => {
  log.header('Testing Appointment Creation');
  
  if (!testCoachId) {
    log.error('No test coach available');
    return false;
  }
  
  // Create appointment for tomorrow at 10:00 AM
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);
  
  const appointmentData = {
    coach_id: testCoachId,
    appointment_time: tomorrow.toISOString(),
    duration_minutes: 60,
    notes: 'Integration test appointment'
  };
  
  const { data, status } = await apiCall('/api/appointments', 'POST', appointmentData);
  
  if (status === 200 && data.success && data.data.id) {
    testAppointmentId = data.data.id;
    log.success(`Appointment created with ID: ${testAppointmentId}`);
    log.info(`Appointment time: ${data.data.appointment_time}`);
    log.info(`Status: ${data.data.status}`);
    return true;
  } else {
    log.error(`Failed to create appointment: ${data.message}`);
    return false;
  }
};

// Test appointment retrieval
const testAppointmentRetrieval = async () => {
  log.header('Testing Appointment Retrieval');
  
  // Test getting user appointments
  const { data, status } = await apiCall('/api/appointments/user');
  
  if (status === 200 && data.success && Array.isArray(data.data)) {
    log.success(`Found ${data.data.length} user appointments`);
    
    // Test getting specific appointment
    if (testAppointmentId) {
      const { data: appointmentData, status: appointmentStatus } = await apiCall(`/api/appointments/${testAppointmentId}`);
      
      if (appointmentStatus === 200 && appointmentData.success) {
        log.success('Individual appointment retrieval successful');
        log.info(`Appointment details: ${JSON.stringify(appointmentData.data, null, 2)}`);
        return true;
      } else {
        log.error('Failed to retrieve individual appointment');
        return false;
      }
    }
    return true;
  } else {
    log.error('Failed to retrieve user appointments');
    return false;
  }
};

// Test appointment update
const testAppointmentUpdate = async () => {
  log.header('Testing Appointment Update');
  
  if (!testAppointmentId) {
    log.error('No test appointment available');
    return false;
  }
  
  const updateData = {
    duration_minutes: 90,
    notes: 'Updated integration test appointment'
  };
  
  const { data, status } = await apiCall(`/api/appointments/${testAppointmentId}`, 'PUT', updateData);
  
  if (status === 200 && data.success) {
    log.success('Appointment updated successfully');
    log.info(`New duration: ${data.data.duration_minutes} minutes`);
    return true;
  } else {
    log.error(`Failed to update appointment: ${data.message}`);
    return false;
  }
};

// Test messages API
const testMessagesAPI = async () => {
  log.header('Testing Messages API');
  
  if (!testAppointmentId) {
    log.error('No test appointment available');
    return false;
  }
  
  // Send a test message
  const messageData = {
    text: 'Test message from integration test',
    sender_type: 'user'
  };
  
  const { data, status } = await apiCall(`/api/appointments/${testAppointmentId}/messages`, 'POST', messageData);
  
  if (status === 200 && data.success) {
    log.success('Message sent successfully');
    
    // Get messages
    const { data: messagesData, status: messagesStatus } = await apiCall(`/api/appointments/${testAppointmentId}/messages`);
    
    if (messagesStatus === 200 && messagesData.success) {
      log.success(`Retrieved ${messagesData.data.length} messages`);
      return true;
    } else {
      log.error('Failed to retrieve messages');
      return false;
    }
  } else {
    log.error(`Failed to send message: ${data.message}`);
    return false;
  }
};

// Test appointment cancellation
const testAppointmentCancellation = async () => {
  log.header('Testing Appointment Cancellation');
  
  if (!testAppointmentId) {
    log.error('No test appointment available');
    return false;
  }
  
  const { data, status } = await apiCall(`/api/appointments/${testAppointmentId}/cancel`, 'PUT', {
    cancel_reason: 'Integration test cleanup'
  });
  
  if (status === 200 && data.success) {
    log.success('Appointment cancelled successfully');
    return true;
  } else {
    log.error(`Failed to cancel appointment: ${data.message}`);
    return false;
  }
};

// Test cleanup
const testCleanup = async () => {
  log.header('Cleaning up test data');
  
  if (testAppointmentId) {
    const { data, status } = await apiCall(`/api/appointments/${testAppointmentId}`, 'DELETE');
    
    if (status === 200 && data.success) {
      log.success('Test appointment deleted successfully');
    } else {
      log.warning('Failed to delete test appointment (may already be cleaned up)');
    }
  }
};

// Main test runner
const runIntegrationTests = async () => {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 APPOINTMENT SYSTEM INTEGRATION TESTS');
  console.log('='.repeat(60) + '\n');
  
  const tests = [
    { name: 'Backend Health Check', fn: testHealthCheck },
    { name: 'Frontend Availability', fn: testFrontendAvailability },
    { name: 'Authentication', fn: testAuthentication },
    { name: 'Coaches API', fn: testCoachesAPI },
    { name: 'Appointment Creation', fn: testAppointmentCreation },
    { name: 'Appointment Retrieval', fn: testAppointmentRetrieval },
    { name: 'Appointment Update', fn: testAppointmentUpdate },
    { name: 'Messages API', fn: testMessagesAPI },
    { name: 'Appointment Cancellation', fn: testAppointmentCancellation }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      log.error(`Test "${test.name}" threw an error: ${error.message}`);
      failed++;
    }
    console.log(''); // Add spacing between tests
  }
  
  // Cleanup
  await testCleanup();
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  console.log(`${colors.green}✅ Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${failed}${colors.reset}`);
  console.log(`📋 Total: ${passed + failed}`);
  
  if (failed === 0) {
    log.success('ALL TESTS PASSED! 🎉');
    console.log('\n🚀 Your appointment system integration is working perfectly!');
    console.log('\n📱 You can now:');
    console.log('   • Access frontend at: http://localhost:5175');
    console.log('   • Use the booking system');
    console.log('   • Test coach dashboard');
    console.log('   • Send messages between users and coaches');
  } else {
    log.error(`${failed} test(s) failed. Please check the errors above.`);
  }
  
  rl.close();
};

// Handle script termination
process.on('SIGINT', () => {
  console.log('\n\n👋 Test interrupted by user');
  rl.close();
  process.exit(0);
});

// Start the tests
runIntegrationTests().catch(error => {
  log.error(`Test runner failed: ${error.message}`);
  process.exit(1);
});

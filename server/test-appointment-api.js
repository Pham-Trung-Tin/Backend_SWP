/**
 * Test script for appointment API endpoints
 * 
 * Usage:
 * node test-appointment-api.js
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';
import readline from 'readline';

// Load environment variables
dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Constants
const API_URL = process.env.API_URL || 'http://localhost:5000';

// Store auth token
let authToken = null;
let userId = null;
let coachId = null;

// Function to prompt for input
const prompt = (question) => {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
};

// Function to handle API requests
const apiRequest = async (endpoint, method = 'GET', body = null) => {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  const options = {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  };
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json();
    return { response, data };
  } catch (error) {
    console.error('API Request Error:', error);
    return { error: error.message };
  }
};

// Function to log in and get auth token
const login = async () => {
  const username = await prompt('Enter username: ');
  const password = await prompt('Enter password: ');
  
  console.log('\n🔑 Logging in...');
  const { data } = await apiRequest('/api/auth/login', 'POST', { username, password });
  
  if (data.success && data.data.token) {
    authToken = data.data.token;
    userId = data.data.user.id;
    console.log('✅ Login successful!');
    console.log(`👤 User ID: ${userId}`);
    console.log(`🔑 Token: ${authToken.substring(0, 10)}...`);
    return true;
  } else {
    console.log('❌ Login failed:', data.message);
    return false;
  }
};

// Function to get coaches
const getCoaches = async () => {
  console.log('\n👨‍⚕️ Fetching coaches...');
  const { data } = await apiRequest('/api/coaches');
  
  if (data.success && data.data) {
    const coaches = data.data;
    console.log(`✅ Found ${coaches.length} coaches`);
    
    coaches.forEach((coach, index) => {
      console.log(`${index + 1}. ${coach.full_name} (ID: ${coach.id})`);
    });
    
    const selection = await prompt('Select coach by number: ');
    const selectedIndex = parseInt(selection) - 1;
    
    if (selectedIndex >= 0 && selectedIndex < coaches.length) {
      coachId = coaches[selectedIndex].id;
      console.log(`✅ Selected coach: ${coaches[selectedIndex].full_name} (ID: ${coachId})`);
      return true;
    } else {
      console.log('❌ Invalid selection');
      return false;
    }
  } else {
    console.log('❌ Failed to fetch coaches:', data.message);
    return false;
  }
};

// Function to create an appointment
const createAppointment = async () => {
  console.log('\n📅 Creating appointment...');
  
  // Get appointment details
  console.log('Enter appointment date and time:');
  const date = await prompt('Date (YYYY-MM-DD): ');
  const time = await prompt('Time (HH:MM): ');
  const duration = await prompt('Duration in minutes (default: 30): ') || '30';
  
  const appointment_time = `${date}T${time}:00`;
  
  const appointmentData = {
    coach_id: coachId,
    appointment_time,
    duration_minutes: parseInt(duration)
  };
  
  console.log('📤 Sending appointment data:', appointmentData);
  
  const { data } = await apiRequest('/api/appointments', 'POST', appointmentData);
  
  if (data.success && data.data) {
    console.log('✅ Appointment created successfully!');
    console.log('📝 Appointment details:');
    console.log(JSON.stringify(data.data, null, 2));
    return data.data.id;
  } else {
    console.log('❌ Failed to create appointment:', data.message);
    return null;
  }
};

// Function to get user appointments
const getUserAppointments = async () => {
  console.log('\n📋 Getting user appointments...');
  
  const { data } = await apiRequest('/api/appointments/user');
  
  if (data.success && data.data) {
    const appointments = data.data;
    console.log(`✅ Found ${appointments.length} appointments`);
    
    appointments.forEach((appointment, index) => {
      console.log(`${index + 1}. Coach: ${appointment.coach_name}`);
      console.log(`   Date: ${new Date(appointment.appointment_time).toLocaleString()}`);
      console.log(`   Status: ${appointment.status}`);
      console.log(`   ID: ${appointment.id}`);
      console.log('-------------------');
    });
    
    return appointments;
  } else {
    console.log('❌ Failed to fetch appointments:', data.message);
    return [];
  }
};

// Function to get appointment by ID
const getAppointmentById = async (appointmentId) => {
  console.log(`\n🔍 Getting appointment with ID: ${appointmentId}`);
  
  const { data } = await apiRequest(`/api/appointments/${appointmentId}`);
  
  if (data.success && data.data) {
    console.log('✅ Appointment found:');
    console.log(JSON.stringify(data.data, null, 2));
    return data.data;
  } else {
    console.log('❌ Failed to fetch appointment:', data.message);
    return null;
  }
};

// Function to update appointment
const updateAppointment = async (appointmentId) => {
  console.log(`\n✏️ Updating appointment with ID: ${appointmentId}`);
  
  // Get current appointment
  const currentAppointment = await getAppointmentById(appointmentId);
  if (!currentAppointment) return false;
  
  // Ask what to update
  console.log('\nWhat would you like to update?');
  console.log('1. Date and time');
  console.log('2. Duration');
  const option = await prompt('Select option: ');
  
  let updateData = {};
  
  if (option === '1') {
    const date = await prompt('New date (YYYY-MM-DD): ');
    const time = await prompt('New time (HH:MM): ');
    updateData.appointment_time = `${date}T${time}:00`;
  } else if (option === '2') {
    const duration = await prompt('New duration in minutes: ');
    updateData.duration_minutes = parseInt(duration);
  } else {
    console.log('❌ Invalid option');
    return false;
  }
  
  console.log('📤 Sending update data:', updateData);
  
  const { data } = await apiRequest(`/api/appointments/${appointmentId}`, 'PUT', updateData);
  
  if (data.success && data.data) {
    console.log('✅ Appointment updated successfully!');
    console.log('📝 Updated appointment details:');
    console.log(JSON.stringify(data.data, null, 2));
    return true;
  } else {
    console.log('❌ Failed to update appointment:', data.message);
    return false;
  }
};

// Function to cancel appointment
const cancelAppointment = async (appointmentId) => {
  console.log(`\n❌ Cancelling appointment with ID: ${appointmentId}`);
  
  const confirmation = await prompt('Are you sure you want to cancel this appointment? (y/n): ');
  
  if (confirmation.toLowerCase() !== 'y') {
    console.log('❌ Cancellation aborted');
    return false;
  }
  
  const { data } = await apiRequest(`/api/appointments/${appointmentId}/cancel`, 'PUT');
  
  if (data.success && data.data) {
    console.log('✅ Appointment cancelled successfully!');
    console.log('📝 Updated appointment details:');
    console.log(JSON.stringify(data.data, null, 2));
    return true;
  } else {
    console.log('❌ Failed to cancel appointment:', data.message);
    return false;
  }
};

// Function to rate appointment
const rateAppointment = async (appointmentId) => {
  console.log(`\n⭐ Rating appointment with ID: ${appointmentId}`);
  
  const rating = await prompt('Rating (1-5): ');
  const content = await prompt('Feedback comments: ');
  
  const ratingData = {
    rating: parseInt(rating),
    content
  };
  
  console.log('📤 Sending rating data:', ratingData);
  
  const { data } = await apiRequest(`/api/appointments/${appointmentId}/rating`, 'POST', ratingData);
  
  if (data.success && data.data) {
    console.log('✅ Appointment rated successfully!');
    console.log('📝 Rating details:');
    console.log(JSON.stringify(data.data, null, 2));
    return true;
  } else {
    console.log('❌ Failed to rate appointment:', data.message);
    return false;
  }
};

// Function to delete appointment
const deleteAppointment = async (appointmentId) => {
  console.log(`\n🗑️ Deleting appointment with ID: ${appointmentId}`);
  
  const confirmation = await prompt('Are you sure you want to delete this appointment? (y/n): ');
  
  if (confirmation.toLowerCase() !== 'y') {
    console.log('❌ Deletion aborted');
    return false;
  }
  
  const { data } = await apiRequest(`/api/appointments/${appointmentId}`, 'DELETE');
  
  if (data.success) {
    console.log('✅ Appointment deleted successfully!');
    return true;
  } else {
    console.log('❌ Failed to delete appointment:', data.message);
    return false;
  }
};

// Main menu
const showMenu = async () => {
  console.log('\n========== APPOINTMENT API TEST MENU ==========');
  console.log('1. Create appointment');
  console.log('2. View my appointments');
  console.log('3. Get appointment by ID');
  console.log('4. Update appointment');
  console.log('5. Cancel appointment');
  console.log('6. Rate appointment');
  console.log('7. Delete appointment');
  console.log('8. Exit');
  
  const option = await prompt('Select option: ');
  
  switch (option) {
    case '1':
      if (await getCoaches()) {
        await createAppointment();
      }
      break;
    case '2':
      await getUserAppointments();
      break;
    case '3':
      const id = await prompt('Enter appointment ID: ');
      await getAppointmentById(id);
      break;
    case '4':
      const updateId = await prompt('Enter appointment ID to update: ');
      await updateAppointment(updateId);
      break;
    case '5':
      const cancelId = await prompt('Enter appointment ID to cancel: ');
      await cancelAppointment(cancelId);
      break;
    case '6':
      const rateId = await prompt('Enter appointment ID to rate: ');
      await rateAppointment(rateId);
      break;
    case '7':
      const deleteId = await prompt('Enter appointment ID to delete: ');
      await deleteAppointment(deleteId);
      break;
    case '8':
      console.log('👋 Exiting...');
      rl.close();
      return false;
    default:
      console.log('❌ Invalid option');
      break;
  }
  
  return true;
};

// Main function
const main = async () => {
  console.log('============================================');
  console.log('📅 APPOINTMENT API TEST TOOL');
  console.log('============================================');
  
  // Login first
  if (!await login()) {
    console.log('❌ Exiting due to login failure');
    rl.close();
    return;
  }
  
  // Show menu repeatedly
  let continueRunning = true;
  while (continueRunning) {
    continueRunning = await showMenu();
  }
};

// Run main function
main().catch(error => {
  console.error('❌ Error:', error);
  rl.close();
});

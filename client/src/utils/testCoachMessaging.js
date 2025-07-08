// Test script to demonstrate coach messaging functionality
export const testCoachMessaging = () => {
  console.log('=== Testing Coach Messaging System ===');
  
  // Check if there are any appointments
  const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
  console.log(`Found ${appointments.length} appointments`);
  
  if (appointments.length === 0) {
    console.log('No appointments found. Creating a test appointment...');
    
    // Create a test appointment
    const testAppointment = {
      id: Math.floor(Math.random() * 1000000),
      userId: 'user123',
      userName: 'Nguyễn Văn Test',
      userEmail: 'test@example.com',
      coachId: 1,
      coachName: 'Nguyên Văn A',
      coachAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      coachRole: 'Coach cai thuốc chuyên nghiệp',
      date: new Date().toISOString(),
      time: '14:00',
      status: 'confirmed',
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('appointments', JSON.stringify([testAppointment]));
    console.log('Test appointment created:', testAppointment);
  }
  
  // Initialize coach messages
  const { initializeCoachMessages } = require('./coachMessages');
  initializeCoachMessages();
  
  // Check messages for each appointment
  appointments.forEach(appointment => {
    const chatKey = `coach_chat_${appointment.id}`;
    const messages = JSON.parse(localStorage.getItem(chatKey) || '[]');
    console.log(`Appointment ${appointment.id} has ${messages.length} messages:`, messages);
    
    const unreadKey = `unread_messages_${appointment.id}`;
    const unreadCount = localStorage.getItem(unreadKey);
    console.log(`Unread messages for appointment ${appointment.id}: ${unreadCount}`);
  });
  
  console.log('=== Coach messaging test completed ===');
};

// Create sample coach users for testing
export const createTestCoachUsers = () => {
  const existingUsers = JSON.parse(localStorage.getItem('nosmoke_users') || '[]');
  
  const testCoaches = [
    {
      id: 'coach1',
      fullName: 'Nguyên Văn A',
      name: 'Nguyên Văn A',
      email: 'coach1@nosmoke.com',
      password: '123456', // In real app, this would be hashed
      role: 'coach',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      specialization: 'Cai thuốc chuyên nghiệp',
      experience: '5 năm',
      rating: 4.8
    },
    {
      id: 'coach2', 
      fullName: 'Trần Thị B',
      name: 'Trần Thị B',
      email: 'coach2@nosmoke.com',
      password: '123456',
      role: 'coach',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      specialization: 'Chuyên gia tâm lý',
      experience: '7 năm',
      rating: 4.9
    }
  ];
  
  // Add coaches if they don't exist
  testCoaches.forEach(coach => {
    const existingCoach = existingUsers.find(u => u.email === coach.email);
    if (!existingCoach) {
      existingUsers.push(coach);
      console.log(`Added test coach: ${coach.fullName}`);
    }
  });
  
  localStorage.setItem('nosmoke_users', JSON.stringify(existingUsers));
  console.log('Test coach users created/updated');
};

// Quick demo function
export const runCoachMessagingDemo = () => {
  console.log('🚀 Running Coach Messaging Demo...');
  
  // Create test users
  createTestCoachUsers();
  
  // Run messaging test
  testCoachMessaging();
  
  console.log('✅ Demo completed! You can now:');
  console.log('1. Login as a coach (coach1@nosmoke.com / 123456)');
  console.log('2. Navigate to Coach Dashboard & Tin nhắn');
  console.log('3. View and send messages to users with appointments');
  console.log('4. Use the "Khởi tạo tin nhắn" button to add sample messages');
};

export default testCoachMessaging;

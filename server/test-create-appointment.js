import Appointment from './src/models/Appointment.js';

/**
 * Test direct appointment creation functionality
 */
const testAppointmentCreation = async () => {
    try {
        console.log('🧪 Testing appointment creation...');
        
        // Sample appointment data
        const appointmentData = {
            coach_id: 13,
            user_id: 18,  // Replace with your actual user ID
            appointment_time: '2025-07-08T10:00:00Z',
            duration_minutes: 60
        };
        
        console.log('📤 Appointment data:', appointmentData);
        
        // Try to create appointment
        const result = await Appointment.create(appointmentData);
        
        console.log('📥 Result:', result);
        
        if (result.error) {
            console.error('❌ Appointment creation failed:', result.error);
        } else {
            console.log('✅ Appointment created successfully:', result);
        }
        
    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
    
    process.exit(0);
};

testAppointmentCreation();

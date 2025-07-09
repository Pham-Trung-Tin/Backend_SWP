import { pool } from './src/config/database.js';
import Appointment from './src/models/Appointment.js';

/**
 * Test updating an appointment
 */
const testUpdateAppointment = async () => {
    try {
        console.log('🧪 Testing appointment update...');
        
        // First, let's get an existing appointment
        const [existingAppointments] = await pool.query(
            'SELECT * FROM appointment ORDER BY id DESC LIMIT 1'
        );
        
        if (existingAppointments.length === 0) {
            console.log('❌ No existing appointments found');
            process.exit(1);
        }
        
        const appointment = existingAppointments[0];
        console.log('📤 Found appointment:', appointment);
        
        // Update to one day later
        const currentTime = new Date(appointment.appointment_time);
        currentTime.setDate(currentTime.getDate() + 1);
        
        // Format in ISO format
        const newAppointmentTime = currentTime.toISOString();
        
        const updateData = {
            appointment_time: newAppointmentTime,
            duration_minutes: 45
        };
        
        console.log('📤 Update data:', updateData);
        
        // Try to update appointment
        const result = await Appointment.update(appointment.id, updateData);
        
        console.log('📥 Result:', result);
        
        if (result.error) {
            console.error('❌ Appointment update failed:', result.error);
        } else {
            console.log('✅ Appointment updated successfully:', result);
        }
        
    } catch (error) {
        console.error('❌ Unexpected error:', error);
    } finally {
        pool.end();
    }
};

testUpdateAppointment();

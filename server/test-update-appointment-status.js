import { pool } from './src/config/database.js';

/**
 * Test script to update appointment status to completed for testing rating functionality
 */
const main = async () => {
    try {
        console.log('🔍 Finding most recent appointment to update status...');
        
        // Get the most recent appointment
        const [appointments] = await pool.query(
            'SELECT * FROM appointment ORDER BY id DESC LIMIT 1'
        );
        
        if (appointments.length === 0) {
            console.log('❌ No appointments found');
            return;
        }
        
        const appointment = appointments[0];
        console.log('📋 Found appointment:', appointment);
        
        // Update status to completed
        const [updateResult] = await pool.query(
            'UPDATE appointment SET status = ? WHERE id = ?',
            ['completed', appointment.id]
        );
        
        if (updateResult.affectedRows > 0) {
            console.log('✅ Successfully updated appointment ID:', appointment.id, 'to completed status');
        } else {
            console.log('❌ Failed to update appointment status');
        }
        
        // Verify the update
        const [verifyResult] = await pool.query(
            'SELECT id, status FROM appointment WHERE id = ?',
            [appointment.id]
        );
        
        console.log('📋 Updated appointment status:', verifyResult[0]);
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        pool.end();
    }
};

main();

import { pool } from './src/config/database.js';

/**
 * Debug script to check appointment-related issues
 */
const main = async () => {
    try {
        console.log('🔍 Checking coach existence...');
        const [coachRows] = await pool.query(
            'SELECT id, username, email, role FROM users WHERE id = ? AND role = ?',
            [13, 'coach']
        );
        
        if (coachRows.length === 0) {
            console.log('⚠️ Coach with ID 13 does not exist or is not a coach');
        } else {
            console.log('✅ Coach found:', coachRows[0]);
        }
        
        console.log('\n🔍 Checking coach availability...');
        const [availabilityRows] = await pool.query(
            `SELECT * FROM coach_availability WHERE coach_id = ?`,
            [13]
        );
        
        if (availabilityRows.length === 0) {
            console.log('⚠️ No availability found for coach with ID 13');
        } else {
            console.log('✅ Coach availability found:', availabilityRows);
        }
        
        // Test date parsing
        console.log('\n🔍 Testing date parsing...');
        const testDates = [
            '2025-07-08T10:00:00Z',
            '2025-7-8T10:00:00Z',
            '2025-07-08T10:00:00'
        ];
        
        for (const dateStr of testDates) {
            try {
                const date = new Date(dateStr);
                console.log(`Date string "${dateStr}" parsed as:`, date);
                console.log('Day of week:', ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()]);
                console.log('Time string:', date.toTimeString().slice(0, 8));
                
                // Check if this date-time falls within any coach availability
                for (const avail of availabilityRows) {
                    const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
                    const timeStr = date.toTimeString().slice(0, 8);
                    
                    if (avail.day_of_week === dayOfWeek && 
                        timeStr >= avail.start_time && 
                        timeStr <= avail.end_time) {
                        console.log('✅ This date-time is within coach availability');
                    } else {
                        console.log('⚠️ This date-time is NOT within coach availability', {
                            expected: {
                                day: dayOfWeek,
                                time: timeStr
                            },
                            actual: {
                                day: avail.day_of_week,
                                start: avail.start_time,
                                end: avail.end_time
                            }
                        });
                    }
                }
            } catch (error) {
                console.log(`❌ Error parsing date "${dateStr}":`, error);
            }
        }
        
        console.log('\n🔍 Checking for existing appointments...');
        const [appointments] = await pool.query(
            `SELECT * FROM appointment WHERE coach_id = ?`,
            [13]
        );
        
        if (appointments.length === 0) {
            console.log('✅ No existing appointments for this coach');
        } else {
            console.log('ℹ️ Existing appointments:', appointments);
        }
        
    } catch (error) {
        console.error('Error during debug checks:', error);
    } finally {
        // Close the connection
        pool.end();
    }
};

main();

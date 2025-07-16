/**
 * Script to add sample coaches to the database
 * Run this if you don't have any coaches in your database
 */

import { pool } from '../config/database.js';
import bcrypt from 'bcryptjs';

const addSampleCoaches = async () => {
    try {
        console.log('🔍 Checking for existing coaches...');
        
        // Check if we already have coaches
        const [existingCoaches] = await pool.query(
            'SELECT COUNT(*) as count FROM users WHERE role = ?',
            ['coach']
        );
        
        if (existingCoaches[0].count > 0) {
            console.log(`✅ Already have ${existingCoaches[0].count} coaches in database`);
            return;
        }
        
        console.log('➕ Adding sample coaches...');
        
        const sampleCoaches = [
            {
                username: 'coach_nguyen_van_a',
                email: 'coach.nguyen@example.com',
                password: 'password123',
                full_name: 'Nguyễn Văn A',
                role: 'coach',
                bio: 'Coach cai thuốc chuyên nghiệp với 5 năm kinh nghiệm',
                specialization: 'Cai thuốc lá, tư vấn tâm lý',
                avatar_url: 'https://randomuser.me/api/portraits/men/32.jpg'
            },
            {
                username: 'coach_tran_thi_b',
                email: 'coach.tran@example.com',
                password: 'password123',
                full_name: 'Trần Thị B',
                role: 'coach',
                bio: 'Chuyên gia tâm lý, hỗ trợ cai nghiện thuốc lá',
                specialization: 'Tâm lý học, liệu pháp nhận thức',
                avatar_url: 'https://randomuser.me/api/portraits/women/44.jpg'
            },
            {
                username: 'coach_pham_minh_c',
                email: 'coach.pham@example.com',
                password: 'password123',
                full_name: 'Phạm Minh C',
                role: 'coach',
                bio: 'Bác sĩ phục hồi chức năng, chuyên về cai nghiện',
                specialization: 'Y học phục hồi chức năng',
                avatar_url: 'https://randomuser.me/api/portraits/men/64.jpg'
            }
        ];
        
        for (const coach of sampleCoaches) {
            // Hash password
            const hashedPassword = await bcrypt.hash(coach.password, 10);
            
            // Insert coach
            const [result] = await pool.query(
                `INSERT INTO users 
                (username, email, password, full_name, role, bio, specialization, avatar_url, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                [
                    coach.username,
                    coach.email,
                    hashedPassword,
                    coach.full_name,
                    coach.role,
                    coach.bio,
                    coach.specialization,
                    coach.avatar_url
                ]
            );
            
            console.log(`✅ Added coach: ${coach.full_name} (ID: ${result.insertId})`);
        }
        
        console.log('🎉 Sample coaches added successfully!');
        
    } catch (error) {
        console.error('❌ Error adding sample coaches:', error);
    }
};

// Run the script
addSampleCoaches()
    .then(() => {
        console.log('✅ Script completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Script failed:', error);
        process.exit(1);
    });

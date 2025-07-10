import { pool } from './src/config/database.js'; 

async function checkTable() { 
  try { 
    const [results] = await pool.execute('DESCRIBE users'); 
    console.log('Cấu trúc bảng users:'); 
    results.forEach(row => console.log(`${row.Field}: ${row.Type} ${row.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${row.Default ? `DEFAULT ${row.Default}` : ''}`)); 
    
    // Kiểm tra dữ liệu trong bảng users
    const [users] = await pool.execute('SELECT id, username, email, membership FROM users LIMIT 5');
    console.log('\nDanh sách users:');
    users.forEach(user => console.log(`ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Membership: ${user.membership || 'NULL'}`));
    
    process.exit(0); 
  } catch (error) { 
    console.error('Lỗi:', error); 
    process.exit(1); 
  } 
} 

checkTable();

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000';

async function testProgressEndpoints() {
  console.log('🧪 Testing Progress API endpoints...\n');
  
  const endpoints = [
    { method: 'GET', path: '/api/progress/user' },
    { method: 'GET', path: '/api/progress/user/2025-07-13' },
    { method: 'PUT', path: '/api/progress/checkin/2025-07-13' },
    { method: 'POST', path: '/api/progress/checkin' },
    { method: 'POST', path: '/api/progress/13' },
    { method: 'GET', path: '/api/progress/13' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint.method} ${endpoint.path}...`);
      
      const response = await fetch(`${API_BASE}${endpoint.path}`, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: endpoint.method !== 'GET' ? JSON.stringify({
          date: '2025-07-13',
          actualCigarettes: 5,
          targetCigarettes: 10
        }) : undefined
      });
      
      const data = await response.json();
      console.log(`  Status: ${response.status}`);
      console.log(`  Response: ${data.message || JSON.stringify(data)}`);
      
    } catch (error) {
      console.log(`  Error: ${error.message}`);
    }
    console.log('');
  }
}

testProgressEndpoints();

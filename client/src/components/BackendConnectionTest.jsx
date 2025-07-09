import React, { useState, useEffect } from 'react';

const BackendConnectionTest = () => {
  const [status, setStatus] = useState('Checking connection...');
  const [error, setError] = useState(null);
  const [responseDetails, setResponseDetails] = useState(null);
  const apiUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Try to connect to the backend server
        setStatus('Connecting to backend...');
        
        console.log(`Testing connection to: ${apiUrl}/api/health-check`);
        
        const response = await fetch(`${apiUrl}/api/health-check`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });
        
        const contentType = response.headers.get('content-type');
        let responseData;
        
        if (contentType && contentType.includes('application/json')) {
          responseData = await response.json();
        } else {
          const text = await response.text();
          responseData = { message: text };
        }
        
        setResponseDetails({
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries([...response.headers.entries()]),
          data: responseData
        });
        
        if (response.ok) {
          setStatus('✅ Successfully connected to backend server!');
        } else {
          setStatus(`❌ Backend returned error: ${response.status} ${response.statusText}`);
          setError(`Error response: ${JSON.stringify(responseData)}`);
        }
      } catch (err) {
        console.error('Backend connection test error:', err);
        setStatus('❌ Failed to connect to backend server');
        setError(err.message);
        
        // Additional debug information
        setResponseDetails({
          error: err.toString(),
          stack: err.stack,
          apiUrl
        });
      }
    };

    testConnection();
  }, [apiUrl]);

  return (
    <div className="backend-test" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Backend Connection Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Connection Status</h2>
        <div style={{ 
          padding: '15px', 
          backgroundColor: status.includes('✅') ? '#e8f5e9' : status.includes('❌') ? '#ffebee' : '#fff8e1',
          borderRadius: '4px',
          marginBottom: '10px'
        }}>
          <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{status}</p>
          {error && <p style={{ color: '#c62828' }}>{error}</p>}
        </div>
      </div>
      
      <div>
        <h2>Configuration</h2>
        <pre style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '10px', 
          borderRadius: '4px',
          overflow: 'auto'
        }}>
          {JSON.stringify({ apiUrl }, null, 2)}
        </pre>
      </div>
      
      {responseDetails && (
        <div style={{ marginTop: '20px' }}>
          <h2>Response Details</h2>
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '10px', 
            borderRadius: '4px',
            overflow: 'auto'
          }}>
            {JSON.stringify(responseDetails, null, 2)}
          </pre>
        </div>
      )}
      
      <div style={{ marginTop: '30px' }}>
        <h2>Debugging Tips</h2>
        <ul>
          <li>Make sure your backend server is running on <code>{apiUrl}</code></li>
          <li>Check for CORS issues if the frontend and backend are on different domains/ports</li>
          <li>Verify that the backend has a <code>/api/health-check</code> endpoint or modify this test</li>
          <li>Check browser console for any network or JavaScript errors</li>
          <li>If using a proxy in development, make sure it's configured correctly</li>
        </ul>
      </div>
    </div>
  );
};

export default BackendConnectionTest;

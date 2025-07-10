import React, { useState } from 'react';
import axios from 'axios';

const MembershipPurchaseTest = () => {
  const [token, setToken] = useState('');
  const [packageId, setPackageId] = useState(2); // Default: Premium
  const [paymentMethod, setPaymentMethod] = useState('momo');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(
        `${API_URL}/packages/purchase`,
        { packageId: Number(packageId), paymentMethod },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data || {
        message: 'Network error or server unavailable',
        error: err.message
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="membership-test-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>Test Membership Purchase API</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label htmlFor="token">JWT Token (from login):</label>
          <input
            type="text"
            id="token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
          />
        </div>
        
        <div>
          <label htmlFor="packageId">Package ID:</label>
          <select 
            id="packageId" 
            value={packageId} 
            onChange={(e) => setPackageId(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          >
            <option value="1">1 - Free</option>
            <option value="2">2 - Premium</option>
            <option value="3">3 - Pro</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="paymentMethod">Payment Method:</label>
          <select 
            id="paymentMethod" 
            value={paymentMethod} 
            onChange={(e) => setPaymentMethod(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          >
            <option value="free">Free (only for Free package)</option>
            <option value="momo">MoMo</option>
            <option value="vnpay">VNPay</option>
            <option value="credit_card">Credit Card</option>
            <option value="bank_transfer">Bank Transfer</option>
          </select>
        </div>
        
        <button 
          type="submit" 
          disabled={loading} 
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#4CAF50', 
            color: 'white', 
            border: 'none', 
            cursor: loading ? 'wait' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Processing...' : 'Purchase Package'}
        </button>
      </form>
      
      {error && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#FFEBEE', border: '1px solid #FFCDD2' }}>
          <h3 style={{ color: '#D32F2F' }}>Error</h3>
          <p><strong>Message:</strong> {error.message}</p>
          {error.error && <p><strong>Details:</strong> {error.error}</p>}
        </div>
      )}
      
      {result && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: result.success ? '#E8F5E9' : '#FFEBEE', border: '1px solid' }}>
          <h3 style={{ color: result.success ? '#2E7D32' : '#D32F2F' }}>API Response</h3>
          <p><strong>Success:</strong> {result.success ? 'Yes' : 'No'}</p>
          <p><strong>Message:</strong> {result.message}</p>
          
          {result.success && result.data && (
            <div style={{ marginTop: '10px' }}>
              <h4>Purchase Details:</h4>
              <p><strong>Membership ID:</strong> {result.data.membershipId}</p>
              <p><strong>Package:</strong> {result.data.packageName} (ID: {result.data.packageId})</p>
              <p><strong>Start Date:</strong> {new Date(result.data.startDate).toLocaleString()}</p>
              <p><strong>End Date:</strong> {result.data.endDate ? new Date(result.data.endDate).toLocaleString() : 'No expiration'}</p>
              <p><strong>Price:</strong> {result.data.price}</p>
              <p><strong>Payment Method:</strong> {result.data.paymentMethod}</p>
              <p><strong>Status:</strong> {result.data.status}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MembershipPurchaseTest;

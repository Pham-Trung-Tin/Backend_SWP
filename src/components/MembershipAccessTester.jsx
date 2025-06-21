import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateCurrentUserMembership, checkCurrentUserAccess } from '../utils/membershipTestHelpers';

/**
 * Component to help with testing membership access restrictions
 */
const MembershipAccessTester = () => {
  const { user, refreshMembership } = useAuth();
  const [message, setMessage] = useState('');
  const [accessStatus, setAccessStatus] = useState(null);

  const handleMembershipChange = async (membership) => {
    const result = await updateCurrentUserMembership(membership);
    if (result.success) {
      setMessage(`Membership changed to ${membership}`);
      refreshMembership();
      checkAccess();
    } else {
      setMessage(`Error: ${result.error}`);
    }
  };

  const checkAccess = () => {
    const status = checkCurrentUserAccess();
    setAccessStatus(status);
  };

  // Style object for the component
  const styles = {
    container: {
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderRadius: '5px',
      padding: '15px',
      color: 'white',
      zIndex: 9999,
      maxWidth: '300px',
      fontFamily: 'monospace',
      fontSize: '12px'
    },
    title: {
      fontSize: '14px',
      margin: '0 0 10px 0',
      fontWeight: 'bold',
      borderBottom: '1px solid #555',
      paddingBottom: '5px'
    },
    userInfo: {
      marginBottom: '10px',
      padding: '5px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '3px'
    },
    buttonContainer: {
      display: 'flex',
      gap: '5px',
      marginBottom: '10px'
    },
    button: {
      padding: '5px 10px',
      border: 'none',
      borderRadius: '3px',
      cursor: 'pointer',
      fontWeight: 'bold'
    },
    freeButton: {
      backgroundColor: '#cccccc',
      color: '#333'
    },
    premiumButton: {
      backgroundColor: '#4caf50',
      color: 'white'
    },
    proButton: {
      backgroundColor: '#2196f3',
      color: 'white'
    },
    message: {
      fontSize: '11px',
      margin: '10px 0',
      padding: '5px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '3px'
    },
    accessStatus: {
      fontSize: '11px',
      margin: '5px 0',
      padding: '5px',
      borderRadius: '3px',
      backgroundColor: (accessStatus?.hasAccess ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)')
    },
    checkButton: {
      backgroundColor: '#ff9800',
      color: 'white',
      padding: '5px 10px',
      border: 'none',
      borderRadius: '3px',
      cursor: 'pointer',
      width: '100%',
      marginTop: '5px',
      fontSize: '11px'
    },
    closeButton: {
      position: 'absolute',
      top: '5px',
      right: '5px',
      background: 'none',
      border: 'none',
      color: 'white',
      fontSize: '16px',
      cursor: 'pointer'
    }
  };

  return (
    <div style={styles.container}>
      <button 
        style={styles.closeButton}
        onClick={() => document.body.removeChild(document.getElementById('membership-tester'))}
      >
        ✕
      </button>
      <h3 style={styles.title}>Membership Access Tester</h3>
      
      <div style={styles.userInfo}>
        <div><strong>User:</strong> {user ? user.name : 'Not logged in'}</div>
        <div><strong>Current Membership:</strong> {user?.membership || 'free'}</div>
      </div>
      
      <div style={styles.buttonContainer}>
        <button 
          style={{...styles.button, ...styles.freeButton}} 
          onClick={() => handleMembershipChange('free')}
        >
          Free
        </button>
        <button 
          style={{...styles.button, ...styles.premiumButton}} 
          onClick={() => handleMembershipChange('premium')}
        >
          Premium
        </button>
        <button 
          style={{...styles.button, ...styles.proButton}} 
          onClick={() => handleMembershipChange('pro')}
        >
          Pro
        </button>
      </div>
      
      {message && <div style={styles.message}>{message}</div>}
      
      <button style={styles.checkButton} onClick={checkAccess}>
        Check Access Status
      </button>
      
      {accessStatus && (
        <div style={{
          ...styles.accessStatus, 
          backgroundColor: accessStatus.hasAccess ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)'
        }}>
          <div><strong>Has Access:</strong> {accessStatus.hasAccess ? 'Yes ✓' : 'No ✗'}</div>
          <div><strong>Reason:</strong> {accessStatus.reason}</div>
          <div><strong>Membership:</strong> {accessStatus.membership}</div>
        </div>
      )}

      <div style={{fontSize: '10px', marginTop: '10px', opacity: 0.7}}>
        Dev tool - Only visible in development mode
      </div>
    </div>
  );
};

export default MembershipAccessTester;

// Function to initialize the tester
export const initMembershipTester = () => {
  // Only run in development mode
  if (process.env.NODE_ENV !== 'production') {
    const testerRoot = document.createElement('div');
    testerRoot.id = 'membership-tester';
    document.body.appendChild(testerRoot);
    
    // Use ReactDOM to render the component
    // This would normally be done with ReactDOM.render() but we'll leave
    // implementation to the application
  }
};

import { useState, useEffect } from 'react';

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    // Function to update the state
    const handleStatusChange = () => {
      setIsOnline(navigator.onLine);
    };

    // Add event listeners
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);

    // Clean up
    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: '#ff6600',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '14px',
        fontWeight: 'bold',
      }}
    >
      <span style={{ fontSize: '18px' }}>📶</span>
      You're offline. Some features may be limited.
    </div>
  );
}
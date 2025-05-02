import React, { useEffect, useState } from 'react';
import { 
  initWebSocket, 
  sendMessage, 
  onMessage, 
  offMessage, 
  onStatusChange, 
  offStatusChange, 
  getConnectionStatus 
} from '../lib/websocket';

/**
 * React hook to manage WebSocket connection and state
 */
function useWebSocket() {
  const [wsStatus, setWsStatus] = useState<string>(getConnectionStatus());
  const [wsResponseMessage, setWsResponseMessage] = useState<string | null>(null);
  
  useEffect(() => {
    // Initialize the WebSocket
    const socket = initWebSocket();
    
    // Handle WebSocket messages
    const handleMessage = (data: any) => {
      setWsResponseMessage(JSON.stringify(data, null, 2));
    };
    
    // Handle connection status changes
    const handleStatusChange = (status: string) => {
      let displayStatus: string;
      
      switch (status) {
        case 'connecting':
          displayStatus = 'Connecting...';
          break;
        case 'connected':
          displayStatus = 'Connected! ✅';
          // Send test message after connection is established
          setTimeout(() => {
            sendMessage({ type: 'ping', timestamp: new Date().toISOString() });
          }, 1000);
          break;
        case 'disconnected':
          displayStatus = 'Disconnected ❌';
          break;
        case 'error':
          displayStatus = 'Connection error ❌';
          break;
        default:
          displayStatus = status;
      }
      
      setWsStatus(displayStatus);
    };
    
    // Register event handlers
    onMessage(handleMessage);
    onStatusChange(handleStatusChange);
    
    // Clean up
    return () => {
      offMessage(handleMessage);
      offStatusChange(handleStatusChange);
    };
  }, []);
  
  return { wsStatus, wsResponseMessage };
}

export default function Healthcheck() {
  const [apiStatus, setApiStatus] = useState<string>('Loading...');
  const [error, setError] = useState<string | null>(null);
  const { wsStatus, wsResponseMessage } = useWebSocket();

  useEffect(() => {
    const checkApi = async () => {
      try {
        const response = await fetch('/api/languages');
        if (response.ok) {
          const data = await response.json();
          setApiStatus(`Connected successfully! Found ${data.length} languages.`);
        } else {
          setApiStatus(`Error: HTTP ${response.status}`);
          setError(`Unable to connect to API: ${response.statusText}`);
        }
      } catch (err) {
        setApiStatus('Connection failed');
        setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
      }
    };

    // Check REST API
    checkApi();
  }, []);

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Application Health Check</h1>
      
      <div className="border rounded-lg p-6 mb-8 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">API Connection Status</h2>
        <div className={`p-4 rounded-md ${apiStatus.includes('success') ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          <p className="font-medium">{apiStatus}</p>
          {error && <p className="mt-2 text-red-600">{error}</p>}
        </div>
      </div>
      
      <div className="border rounded-lg p-6 mb-8 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">WebSocket Connection Status</h2>
        <div className={`p-4 rounded-md ${wsStatus.includes('Connected') ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          <p className="font-medium">{wsStatus}</p>
          {wsResponseMessage && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Server Response:</p>
              <pre className="bg-gray-800 text-green-400 p-3 rounded text-xs overflow-auto">{wsResponseMessage}</pre>
            </div>
          )}
        </div>
      </div>

      <div className="border rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Frontend Information</h2>
        <ul className="space-y-2">
          <li><strong>React Rendering:</strong> ✅ Working</li>
          <li><strong>Current Time:</strong> {new Date().toLocaleTimeString()}</li>
          <li><strong>Browser:</strong> {navigator.userAgent}</li>
        </ul>
      </div>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { initWebSocket, sendMessage, onMessage, offMessage } from '../lib/websocket';

function useWebSocket() {
  const [wsStatus, setWsStatus] = useState<string>('Connecting...');
  const [wsResponseMessage, setWsResponseMessage] = useState<string | null>(null);
  
  useEffect(() => {
    // Try to initialize the WebSocket
    let socket: WebSocket | null = null;
    try {
      socket = initWebSocket();
      
      if (socket) {
        // Update status based on socket state
        const updateSocketStatus = () => {
          if (!socket) return;
          
          switch (socket.readyState) {
            case WebSocket.CONNECTING:
              setWsStatus('Connecting...');
              break;
            case WebSocket.OPEN:
              setWsStatus('Connected! ✅');
              break;
            case WebSocket.CLOSING:
              setWsStatus('Closing...');
              break;
            case WebSocket.CLOSED:
              setWsStatus('Disconnected ❌');
              break;
          }
        };
        
        updateSocketStatus();
        
        // Handle connection open
        const handleOpen = () => {
          setWsStatus('Connected! ✅');
          // Send test message after connection is established
          setTimeout(() => {
            if (socket && socket.readyState === WebSocket.OPEN) {
              sendMessage({ type: 'ping', timestamp: new Date().toISOString() });
            }
          }, 1000);
        };
        
        // Handle WebSocket messages
        const handleMessage = (data: any) => {
          setWsResponseMessage(JSON.stringify(data, null, 2));
          setWsStatus('Connected! ✅');
        };
        
        // Handle connection errors
        const handleError = () => {
          setWsStatus('Connection error ❌');
        };
        
        // Handle connection closed
        const handleClose = () => {
          setWsStatus('Disconnected ❌');
        };
        
        // Register message handler
        socket.addEventListener('open', handleOpen);
        socket.addEventListener('error', handleError);
        socket.addEventListener('close', handleClose);
        onMessage(handleMessage);
        
        // Clean up
        return () => {
          if (socket) {
            socket.removeEventListener('open', handleOpen);
            socket.removeEventListener('error', handleError);
            socket.removeEventListener('close', handleClose);
            offMessage(handleMessage);
          }
        };
      } else {
        setWsStatus('Failed to initialize WebSocket connection ❌');
      }
    } catch (error) {
      console.error('Error setting up WebSocket:', error);
      setWsStatus(`WebSocket error: ${error instanceof Error ? error.message : String(error)}`);
    }
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
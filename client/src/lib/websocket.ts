/**
 * WebSocket connection utility for real-time communication
 */

// Private module variables
let socket: WebSocket | null = null;
let reconnectAttempts = 0;
let connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error' = 'disconnected';
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 1000;

export interface MessageCallback {
  (message: any): void;
}

const messageCallbacks: Set<MessageCallback> = new Set();
const statusCallbacks: Set<(status: string) => void> = new Set();

/**
 * Notify all status callbacks about connection status changes
 */
function notifyStatusChange(): void {
  statusCallbacks.forEach(callback => callback(connectionStatus));
}

/**
 * Get the current connection status
 */
export function getConnectionStatus(): string {
  return connectionStatus;
}

/**
 * Register a callback for connection status changes
 */
export function onStatusChange(callback: (status: string) => void): void {
  statusCallbacks.add(callback);
  // Immediately notify with current status
  callback(connectionStatus);
}

/**
 * Remove a status change callback
 */
export function offStatusChange(callback: (status: string) => void): void {
  statusCallbacks.delete(callback);
}

/**
 * Initialize WebSocket connection
 */
export function initWebSocket(): WebSocket | null {
  // Return existing connection if already connected
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return socket;
  }

  // Reset connection if socket exists but is closing or closed
  if (socket) {
    socket = null;
  }

  try {
    // Determine the correct WebSocket protocol based on current window protocol
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    
    // Use current window host, which already includes port if it exists
    const host = window.location.host || window.location.hostname;
    
    // Construct WebSocket URL with fallback to prevent undefined port
    const wsUrl = `${protocol}//${host}/ws`;
    console.log(`Connecting to WebSocket at ${wsUrl}`);

    // Update status
    connectionStatus = 'connecting';
    notifyStatusChange();

    // Create new WebSocket connection
    socket = new WebSocket(wsUrl);

    // Set up event handlers
    socket.onopen = () => {
      console.log('WebSocket connected');
      reconnectAttempts = 0;
      connectionStatus = 'connected';
      notifyStatusChange();
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        
        // Notify all registered callbacks
        messageCallbacks.forEach(callback => callback(data));
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      connectionStatus = 'error';
      notifyStatusChange();
    };

    socket.onclose = (event) => {
      console.log(`WebSocket closed with code ${event.code}`);
      connectionStatus = 'disconnected';
      notifyStatusChange();
      socket = null;

      // Try to reconnect if not explicitly closed by the client
      if (event.code !== 1000 && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        const delay = RECONNECT_DELAY * reconnectAttempts;
        console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
        setTimeout(initWebSocket, delay);
      }
    };

    return socket;
  } catch (error) {
    console.error('Failed to initialize WebSocket:', error);
    connectionStatus = 'error';
    notifyStatusChange();
    return null;
  }
}

/**
 * Send a message through the WebSocket if connected
 */
export function sendMessage(message: any): boolean {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.error('WebSocket not connected, cannot send message');
    return false;
  }

  try {
    const messageString = typeof message === 'string' ? message : JSON.stringify(message);
    socket.send(messageString);
    return true;
  } catch (error) {
    console.error('Error sending WebSocket message:', error);
    return false;
  }
}

/**
 * Register a callback for incoming messages
 */
export function onMessage(callback: MessageCallback): void {
  messageCallbacks.add(callback);
}

/**
 * Remove a message callback
 */
export function offMessage(callback: MessageCallback): void {
  messageCallbacks.delete(callback);
}

/**
 * Close the WebSocket connection
 */
export function closeWebSocket(): void {
  if (socket) {
    socket.close(1000, 'Closed by client');
    socket = null;
  }
}

// Do not automatically initialize - let components initialize when needed
// initWebSocket();
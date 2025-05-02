/**
 * WebSocket connection utility for real-time communication
 */

let socket: WebSocket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 1000;

interface MessageCallback {
  (message: any): void;
}

const messageCallbacks: Set<MessageCallback> = new Set();

/**
 * Initialize WebSocket connection
 */
export function initWebSocket(): WebSocket | null {
  if (socket && socket.readyState === WebSocket.OPEN) {
    console.log('WebSocket already connected');
    return socket;
  }

  try {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    console.log(`Connecting to WebSocket at ${wsUrl}`);

    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('WebSocket connected');
      reconnectAttempts = 0;
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
    };

    socket.onclose = (event) => {
      console.log(`WebSocket closed with code ${event.code}`);
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
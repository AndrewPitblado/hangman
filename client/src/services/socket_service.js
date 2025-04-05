import { io } from 'socket.io-client';

// Use environment variable for server URL with fallback
const SERVER_URL = import.meta.env.VITE_SOCKET_URL ||'http://localhost:3001';
console.log('Connecting to server at:', SERVER_URL);
//import.meta.env.VITE_SOCKET_URL || add this in for production!!

// Create socket connection
export const socket = io(SERVER_URL, {
  path:'/socket',
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 500,
  timeout: 20000,
  transports: ['websocket', 'polling'],
  pingInterval: 5000,
  pingTimeout: 10000,
});

// Add to socket_service.js after creating socket
socket.onAny((event, ...args) => {
  console.log(`[Socket Debug] Event "${event}" received with:`, args);
});

// Store the current room information for potential reconnection
let currentGameInfo = null;
// Set up custom heartbeat mechanism in addition to Socket.IO's built-in ping/pong
let heartbeatInterval = null;
let missedHeartbeats = 0;
const MAX_MISSED_HEARTBEATS = 3;

// Start custom heartbeat when connected
const startHeartbeat = () => {
  console.log('Starting heartbeat mechanism');
  clearInterval(heartbeatInterval); // Clear any existing heartbeat
  missedHeartbeats = 0;
  
  heartbeatInterval = setInterval(() => {
    if (socket.connected) {
      console.log('Sending heartbeat...');
      
      // Set up a timeout to detect missed responses
      const heartbeatTimeout = setTimeout(() => {
        missedHeartbeats++;
        console.log(`Heartbeat response timeout. Missed: ${missedHeartbeats}`);
        
        // If we've missed too many heartbeats, try to reconnect
        if (missedHeartbeats > MAX_MISSED_HEARTBEATS) {
          console.warn(`Missed ${missedHeartbeats} heartbeats. Reconnecting...`);
          socket.disconnect();
          setTimeout(() => {
            socket.connect();
          }, 1000);
          missedHeartbeats = 0;
        }
      }, 5000); // Wait 5 seconds for response
      // Emit with acknowledgment
      socket.emit('heartbeat', () => {
        // Successfully received server acknowledgment
        clearTimeout(heartbeatTimeout);
        missedHeartbeats = 0;
        console.log('Received heartbeat acknowledgment');
      });
    }
  }, 10000); // Send a heartbeat every 10 seconds
};

// Add a direct heartbeat check function
export const checkHeartbeat = () => {
  return new Promise((resolve) => {
    if (!socket.connected) {
      resolve({success: false, message: 'Socket not connected'});
      return;
    }
    
    console.log('Sending manual heartbeat check...');
    socket.emit('heartbeat', () => {
      console.log('Manual heartbeat successful');
      resolve({success: true, message: 'Heartbeat received'});
    });
    
    // Timeout after 3 seconds
    setTimeout(() => {
      resolve({success: false, message: 'Heartbeat timed out'});
    }, 3000);
  });
};

// Reset missed heartbeats when we receive a response
socket.on('heartbeat-response', () => {
  console.log('Received heartbeat response');
  missedHeartbeats = 0;
});

// Log connection status
socket.on('connect', () => {
  console.log('Connected to server with ID:', socket.id);
  startHeartbeat(); // Start the heartbeat
  
  // If we were in a game before disconnection, attempt to rejoin
  if (currentGameInfo) {
    console.log('Attempting to rejoin game:', currentGameInfo.gameId);
    socket.emit('rejoinGame', currentGameInfo);
  }
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
  // Try to fall back to polling if using websocket fails
  if (socket.io.engine.transport.name === 'websocket') {
    console.log('Websocket connection failed, falling back to polling');
    socket.io.engine.transport.name = 'polling';
  }
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
  clearInterval(heartbeatInterval); // Stop heartbeat on disconnect
});

socket.on('reconnect', (attemptNumber) => {
  console.log(`Reconnected to server after ${attemptNumber} attempts`);
  startHeartbeat(); // Restart heartbeat on reconnect
});

socket.on('reconnect_attempt', (attemptNumber) => {
  console.log(`Reconnection attempt: ${attemptNumber}`);
});

socket.on('reconnect_failed', () => {
  console.error('Failed to reconnect to the server');
});

// Add connection status monitoring function that can be called from components
export const checkConnectionStatus = () => {
  const status = {
    connected: socket.connected,
    id: socket.id,
    transport: socket.io?.engine?.transport?.name || 'not connected',
    missedHeartbeats: missedHeartbeats
  };
  
  console.log('Connection status:', status);
  return status;
};

// Export functions to manage room state for reconnection
export const setCurrentGame = (gameData) => {
  currentGameInfo = gameData;
};

export const clearCurrentGame = () => {
  currentGameInfo = null;
};

// Manually reconnect function that can be called from UI
export const forceReconnect = () => {
  socket.disconnect();
  setTimeout(() => {
    socket.connect();
  }, 1000);
  return true;
};
import React from 'react';
import { socket, forceReconnect, checkConnectionStatus, checkHeartbeat } from '../services/socket_service';
import '../styles/components/ConnectionStatus.css';

function ConnectionStatus({ showControls = true }) {
  const [error, setError] = React.useState('');
  const [isConnected, setIsConnected] = React.useState(socket.connected);
  
  React.useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    
    setIsConnected(socket.connected);
    
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, []);

  const status = isConnected ? 'Connected' : 'Disconnected';
  const statusClass = isConnected ? 'status-connected' : 'status-disconnected';
  
  return (
    <div className="connection-status">
      <p className={statusClass}>
        Status: {status}
        {isConnected && ` (${socket.io.engine.transport.name})`}
      </p>
      
      {showControls && (
        <div className="connection-controls">
          <button onClick={checkConnectionStatus}>
            Check Connection
          </button>
          <button 
            onClick={() => {
              forceReconnect();
              setError('Reconnecting to server...');
              setTimeout(() => setError(''), 2000);
            }}
            disabled={isConnected}
          >
            Force Reconnect
          </button>
          <button 
            onClick={async () => {
              const result = await checkHeartbeat();
              setError(`Heartbeat test: ${result.message}`);
              setTimeout(() => setError(''), 3000);
            }}
          >
            Test Heartbeat
          </button>
        </div>
      )}
      
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

export default ConnectionStatus;
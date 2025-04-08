import React, { useState, useEffect } from 'react';
import { 
  socket, 
  clearCurrentGame, 
  setCurrentGame, 
  checkConnectionStatus, 
  forceReconnect,
  checkHeartbeat
} from '../services/socket_service';
import Hangman from './Hangman';
import '../styles/components/GameInterface.css';
import ConnectionStatus from './connectionStatus';
 // Adjust import to your setup

function GameInterface({ onReturn }) {
  const [view, setView] = useState('menu'); // menu, create, join, game, play
  const [username, setUsername] = useState('');
  const [gameId, setGameId] = useState('');
  const [gameData, setGameData] = useState(null);
  const [players, setPlayers] = useState([]);
  const [gameState, setGameState] = useState(null);
  const [customWord, setCustomWord] = useState('');
  const [error, setError] = useState('');
  const [guess, setGuess] = useState('');
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastGuesser, setLastGuesser] = useState(null);

  // Add this for visual consistency with single player
  const [notification, setNotification] = useState('');
  
  // Show a temporary notification
  const showNotification = (message, duration = 2000) => {
    setNotification(message);
    setTimeout(() => setNotification(''), duration);
  };

  // Add this to RoomInterface.jsx
const checkSocketStatus = () => {
  console.log(`Socket status: ${socket.connected ? 'Connected' : 'Disconnected'}`);
  console.log(`Socket ID: ${socket.id}`);
  console.log(`Transport: ${socket.io.engine.transport.name}`);
};



  useEffect(() => {
    console.log('Socket connection established:', socket.connected);
    console.log('Socket ID:', socket.id);
    setIsConnected(socket.connected);
    const checkSocketReady = () => {
      if (socket.connected) {
        console.log("Socket is connected and ready");
      } else {
        console.log("Socket not ready yet, waiting...");
        setTimeout(checkSocketReady, 500);
      }
    };
    checkSocketReady();
    checkSocketStatus();
    // Game creation response
    socket.on('gameCreated', (data) => {
      console.log('RECEIVED gameCreated event:', data);
      setGameData(data);
      setPlayers(data.players);
      setView('game');
      setError('');
      showNotification('Game created successfully!');
      
      // Store game info for reconnection
      setCurrentGame({
        gameId: data.gameId,
        username: username,
        isHost: true
      });
  });

    // Game joining response
    socket.on('gameJoined', (data) => {
      setGameData(data);
      setPlayers(data.players);
      setView('game');
      setError('');
      showNotification(`Joined game ${data.gameId}`);
      
      // Store game info for reconnection
      setCurrentGame({
        gameId: data.gameId,
        username: username,
        isHost: false
      });
    });

     // New player joined the game
     socket.on('playerJoined', (player) => {
      setPlayers(prev => [...prev, player]);
      showNotification(`${player.username} joined the game!`);
    });

    // Player left the game
    socket.on('playerLeft', (playerId) => {
      const leavingPlayer = players.find(p => p.id === playerId);
      setPlayers(prev => prev.filter(p => p.id !== playerId));
      if (leavingPlayer) {
        showNotification(`${leavingPlayer.username} left the game`);
      }
    });

    // Host changed
    socket.on('hostChanged', (newHost) => {
      setGameData(prev => ({ ...prev, host: newHost, isHost: socket.id === newHost.id }));
      showNotification(`${newHost.username} is now the host`);
    });

    // Game started
    socket.on('gameStarted', (data) => {
      setGameState(data);
      setView('play');
      showNotification('The game has started!');
    });

    // Game state updated
    socket.on('gameStateUpdate', (data) => {
      setGameState(data);
      if (data.guesser) {
        setLastGuesser(data.guesser);
      }
    });

    // Game reset
    socket.on('gameReset', (data) => {
      setGameState(null);
      setPlayers(data.players);
      setView('game');
      showNotification('Game reset. Ready for a new round!');
    });

    // Error handling
    socket.on('error', (data) => {
      setError(data.message);
      setTimeout(() => setError(''), 5000);
    });

    return () => {
      socket.off('gameCreated');
      socket.off('gameJoined');
      socket.off('playerJoined');
      socket.off('playerLeft');
      socket.off('hostChanged');
      socket.off('gameStarted');
      socket.off('gameStateUpdate');
      socket.off('gameReset');
      socket.off('error');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [username, players]);

  const createGame = (e) => {
    e.preventDefault();
    console.log('createGame called');
    setError('');
    
    if (!socket.connected) {
      setError('Not connected to server. Attempting to reconnect...');
      forceReconnect();
      return;
    }
    
    if (username.trim()) {
      console.log(`Emitting 'createGame' event with username: ${username.trim()}`);
      
      // Add a callback to check if the event was received
      socket.emit('createGame', username.trim(), (response) => {
        console.log('Received acknowledgement:', response);
        if (response && response.error) {
          setError(response.error);
        }
      });
      
      // Check event listeners to make sure 'gameCreated' is registered
      console.log('Active listeners for gameCreated:', 
        socket.listeners('gameCreated').length);
    } else {
      setError('Username is required');
    }
  };

  const joinGame = (e) => {
    e.preventDefault();
    if (username.trim() && gameId.trim()) {
      socket.emit('joinGame', {
        gameId: gameId.trim().toUpperCase(),
        username: username.trim()
      });
    } else {
      setError('Username and Game ID are required');
    }
  };

  const startGame = () => {
    if (gameData?.isHost) {
      socket.emit('startMultiplayerGame', { 
        word: customWord.trim() || null,
        difficulty: 'medium'
      });
    }
  };

  const submitGuess = (e) => {
    e.preventDefault();
    if (guess.trim() && !gameData?.isHost) {
      socket.emit('guessLetter', guess.trim()[0].toLowerCase());
      setGuess('');
    }
  };

  const playAgain = () => {
    if (gameData?.isHost && gameState?.gameOver) {
      socket.emit('playAgain');
    }
  };

  const leaveGame = () => {
    clearCurrentGame();
    setView('menu');
    setGameData(null);
    setPlayers([]);
    setGameState(null);
  };

//   const renderConnectionStatus = () => {
//     const status = socket.connected ? 'Connected' : 'Disconnected';
//     const statusClass = socket.connected ? 'status-connected' : 'status-disconnected';
    
//     return (
//       <div className="connection-status">
//         <p className={statusClass}>
//           Status: {status}
//           {socket.connected && ` (${socket.io.engine.transport.name})`}
//         </p>
//         <div className="connection-controls">
//           <button onClick={checkConnectionStatus}>
//             Check Connection
//           </button>
//           <button 
//             onClick={() => {
//               forceReconnect();
//               setError('Reconnecting to server...');
//               setTimeout(() => setError(''), 2000);
//             }}
//             disabled={socket.connected}
//           >
//             Force Reconnect
//           </button>
//           <button 
//           onClick={async () => {
//             const result = await checkHeartbeat();
//             setError(`Heartbeat test: ${result.message}`);
//             setTimeout(() => setError(''), 3000);
//           }}
//         >
//           Test Heartbeat
//         </button>
//       </div>
//     </div>
//   );
// };

const renderMenu = () => (
  <div className="game-container">
    <div className="game-header">
      <h2>Multiplayer Hangman</h2>
    </div>
    
    <ConnectionStatus/>
    
    <div className="menu-buttons">
      <button className="button-primary" onClick={() => setView('create')}>Create Game</button>
      <button className="button-primary" onClick={() => setView('join')}>Join Game</button>
      <button className="button-secondary" onClick={onReturn}>Back to Main Menu</button>
    </div>
    
    {error && <div className="error-message">{error}</div>}
  </div>
);

const renderCreateGame = () => (
  <div className="game-container">
    <div className="game-header">
      <h2>Create New Game</h2>
    </div>
    
    <form onSubmit={createGame} className="game-form">
      <div className="form-group">
        <label htmlFor="username">Your Username</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Enter your username"
          required
        />
      </div>
      
      <div className="form-actions">
        <button type="submit" className="button-primary">Create Game</button>
        <button type="button" className="button-secondary" onClick={() => setView('menu')}>Back</button>
      </div>
    </form>
    
    {error && <div className="error-message">{error}</div>}
  </div>
);

const renderJoinGame = () => (
  <div className="game-container">
    <div className="game-header">
      <h2>Join Existing Game</h2>
    </div>
    
    <form onSubmit={joinGame} className="game-form">
      <div className="form-group">
        <label htmlFor="username">Your Username</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Enter your username"
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="gameid">Game ID</label>
        <input
          id="gameid"
          type="text"
          value={gameId}
          onChange={e => setGameId(e.target.value.toUpperCase())}
          placeholder="6-digit Game ID"
          maxLength={6}
          required
        />
      </div>
      <div className="form-actions">
          <button type="submit" className="button-primary">Join Game</button>
          <button type="button" className="button-secondary" onClick={() => setView('menu')}>Back</button>
        </div>
      </form>
      
      {error && <div className="error-message">{error}</div>}
    </div>
  );

  const renderGameLobby = () => (
    <div className="game-container">
      <div className="game-header">
        <h2>Game Lobby: {gameData?.gameId}</h2>
      </div>
      
      <div className="game-content">
        <div className="game-info">
          <div className="share-code">
            <p>Share this code with friends:</p>
            <div className="game-id">{gameData?.gameId}</div>
            <button className='button-primary' onClick={() => {
              navigator.clipboard.writeText(gameData?.gameId);
              showNotification('Game ID copied to clipboard!');
            }
            }>
              Copy Code
            </button>
          </div>
        </div>
        
        <div className="players-panel">
          <h3>Players ({players.length})</h3>
          <ul className="players-list">
            {players.map(player => (
              <li key={player.id} className={player.id === gameData?.host?.id ? 'host' : ''}>
                {player.username} 
                {player.id === gameData?.host?.id ? ' 👑' : ''}
                {player.id === socket.id ? ' (You)' : ''}
              </li>
            ))}
          </ul>
        </div>

        {gameData?.isHost && (
          <div className="host-controls">
            <h3>Host Controls</h3>
            <div className="form-group">
              <label htmlFor="customWord">Custom Word (Optional)</label>
              <input
                id="customWord"
                type="text"
                value={customWord}
                onChange={e => setCustomWord(e.target.value)}
                placeholder="Leave blank for random word"
              />
            </div>
            
            <button 
              className="button-primary"
              onClick={startGame}
              disabled={players.length < 2}
            >
              Start Game
            </button>
            
            {players.length < 2 && (
              <p className="help-text">Need at least one more player to start</p>
            )}
          </div>
        )}

{!gameData?.isHost && (
          <div className="waiting-message">
            <p>Waiting for host to start the game...</p>
          </div>
        )}
      </div>
      
      <div className="game-footer">
        <button className="button-secondary" onClick={leaveGame}>Leave Game</button>
      </div>
      {notification && (
        <div className="notification">{notification}</div>
      )}
    </div>
  );

  const renderPlayGame = () => (
    <div className="game-container">
      <div className="game-header">
        <h2>
          {gameData?.isHost ? 'You are the Host' : 'Multiplayer Hangman'}
          <span className="game-id-small">Game: {gameData?.gameId}</span>
        </h2>
      </div>
      
      <div className="game-content">
        {/* Hangman visualization - if you have a Hangman component */}
        <div className="hangman-display">
          {/* If you have a Hangman component from single player mode */}
          <Hangman attemptsLeft={gameState?.attemptsLeft} />
          
        
        </div>
        
        <div className="word-display-container">
          <p className="word-display">{gameState?.displayWord}</p>
          {gameData?.isHost && <p className="host-word">Word: {gameState?.word}</p>}
        </div>
        
        <div className="game-status">
          {lastGuesser && !gameState?.gameOver && (
            <p className="last-guess">
              {lastGuesser} guessed most recently
            </p>
          )}
          {gameState?.gameOver && (
            <div className={`game-result ${gameState.won ? 'win' : 'lose'}`}>
              <h3>{gameState.won ? '🎉 Players Win!' : '😞 Game Over!'}</h3>
              <p>The word was: <strong>{gameState.word}</strong></p>
            </div>
          )}
        </div>
        
        {!gameData?.isHost && !gameState?.gameOver && (
          <form onSubmit={submitGuess} className="guess-form">
            <div className="form-group">
              <input
                type="text"
                value={guess}
                onChange={e => setGuess(e.target.value)}
                maxLength={1}
                placeholder="Guess a letter"
                className="guess-input"
              />
              <button type="submit" className="button-primary">Guess</button>
            </div>
          </form>
        )}

        <div className="guessed-letters">
          <h3>Guessed Letters</h3>
          <div className="letters-container">
            {gameState?.guessedLetters?.map(letter => (
              <span 
                key={letter} 
                className={`letter ${gameState.word?.includes(letter) ? 'correct' : 'incorrect'}`}
              >
                {letter}
              </span>
            )) || <span className="no-guesses">No guesses yet</span>}
          </div>
        </div>
      </div>
      
      <div className="game-footer">
        {gameData?.isHost && gameState?.gameOver && (
          <button className="button-primary" onClick={playAgain}>Play Again</button>
        )}
        <button className="button-secondary" onClick={leaveGame}>Leave Game</button>
      </div>
      
      {notification && (
        <div className="notification">{notification}</div>
      )}
    </div>
  );

  // Render the appropriate view
  switch (view) {
    case 'create':
      return renderCreateGame();
    case 'join':
      return renderJoinGame();
    case 'game':
      return renderGameLobby();
    case 'play':
      return renderPlayGame();
    default:
      return renderMenu();
  }
}

export default GameInterface;
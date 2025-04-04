import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import Hangman from './Hangman';
import WordDisplay from './WordDisplay';
import Keyboard from './Keyboard';
import GameOverModal from './GameOverModal';

function Game() {
  const [gameState, setGameState] = useState({
    word: '',          // This will now only be known when game is over
    displayWord: '',   // Word with blanks as sent from server
    guessedLetters: [], // Letters already guessed
    attemptsLeft: 6,   // Number of attempts remaining
    gameOver: false,   // Is the game over?
    won: false,        // Did the player win?
    difficulty: 'medium' // Default difficulty
  });
  
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    // Connect to the WebSocket server
    socketRef.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001', {
      path: '/socket', // Using a custom path
      transports: ['websocket'], // Try forcing websocket transport
      reconnection: true,
      reconnectionAttempts: 5
    });
    
    // Handle connection events
    socketRef.current.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
      startNewGame();
    });
    
    // Handle game state updates from server
    socketRef.current.on('gameState', (newState) => {
      console.log('Received game state:', newState);
      setGameState(prevState => ({
        ...prevState,
        ...newState
      }));
    });
    
    // Handle errors
    socketRef.current.on('error', (error) => {
      console.error('Socket error:', error);
    });
    
    // Clean up on unmount
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  // No longer need this global word hack
  // useEffect(() => {
  //   window.gameWord = gameState.word;
  // }, [gameState.word]);

  // Function to handle letter guesses - now sends to server
  const handleLetterGuess = (letter) => {
    if (gameState.gameOver || !connected || gameState.guessedLetters.includes(letter)) {
      return;
    }
    
    console.log(`Letter guessed: ${letter}`);
    socketRef.current.emit('guessLetter', letter);
  };

  // Start a new game - now requests from server
  const startNewGame = (difficulty = 'medium') => {
    console.log('Starting new game');
    
    // Add animation class to game container when restarting
    const gameContainer = document.querySelector('.game-container');
    if (gameContainer) {
      gameContainer.classList.remove('fadeInUp');
      void gameContainer.offsetWidth; // Trigger reflow to restart animation
      gameContainer.classList.add('fadeInUp');
    }
    
    if (connected) {
      socketRef.current.emit('startGame', difficulty);
    }
  };

  return (
    <div className="game-container">
      <h1 className="game-title">Hangman Game</h1>
      
      <Hangman attemptsLeft={gameState.attemptsLeft} />
      
      <WordDisplay 
        displayWord={gameState.displayWord} 
      />
      
      <div className="difficulty-controls">
        <button onClick={() => startNewGame('easy')}>Easy</button>
        <button onClick={() => startNewGame('medium')}>Medium</button>
        <button onClick={() => startNewGame('hard')}>Hard</button>
        <button onClick={() => startNewGame('expert')}>Expert</button>
      </div>
      
      <Keyboard 
        guessedLetters={gameState.guessedLetters}
        onLetterClick={handleLetterGuess}
        disabled={gameState.gameOver || !connected}
      />
      
      <GameOverModal
        isWon={gameState.won}
        word={gameState.word}
        onPlayAgain={() => startNewGame(gameState.difficulty)}
        isVisible={gameState.gameOver}
      />
      
      {!connected && <div className="connection-error">Connecting to server...</div>}
    </div>
  );
}

export default Game;
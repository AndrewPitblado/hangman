import { useState, useEffect, useRef } from 'react';
import { socket } from '../services/socket_service'; // Adjust import to your setup
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
  
  
  const [connected, setConnected] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    // Use the shared socket
    setConnected(socket.connected);
    
    const handleConnect = () => {
      console.log('Connected to server');
      setConnected(true);
      startNewGame();
    };

    if (socket.connected) {
      handleConnect();
    }

    socket.on('connect', handleConnect);
    
    // Handle game state updates from server
    socket.on('gameState', (newState) => {
      console.log('Received game state:', newState);
      setGameState(prevState => ({
        ...prevState,
        ...newState
      }));
    });
    
    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
    
    // Clean up on unmount
    return () => {
      socket.off('connect', handleConnect);
      socket.off('gameState');
      socket.off('error');
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
    socket.emit('guessLetter', letter);
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
      socket.emit('startGame', difficulty);
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
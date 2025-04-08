import { useState, useEffect, useRef } from 'react';
import { socket } from '../services/socket_service'; // Adjust import to your setup
import Hangman from './Hangman';
import WordDisplay from './WordDisplay';
import Keyboard from './Keyboard';
import GameOverModal from './GameOverModal';
import ConnectionStatus from './ConnectionStatus';
import GuessedLetters from './GuessedLetters';

function Game({onReturn}) {
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
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState('');
  const [activeDifficulty, setActiveDifficulty] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const initialInstructionShown = useRef(false); // Track if initial instruction is shown

   // Show a temporary notification
   const showNotification = (message, duration = 2000) => {
    setNotification(message);
    setTimeout(() => setNotification(''), duration);
  };

  // Initialize socket connection
  useEffect(() => {
    // Use the shared socket
    setConnected(socket.connected);
    
    const handleConnect = () => {
      console.log('Connected to server');
      setConnected(true);
      // Show initial instruction if not shown yet
      if (!initialInstructionShown.current) {
        showNotification('Select a difficulty level to begin', 4000);
        initialInstructionShown.current = true;
      }
    };

    if (socket.connected && !initialInstructionShown.current) {
      handleConnect();
    }

    socket.on('connect', handleConnect);
    
    // Handle game state updates from server
    socket.on('gameState', (newState) => {
      console.log('Received game state:', newState);
      const isInitialGameState = !gameStarted || loading;
      const isLetterGuess = !isInitialGameState;

      let newlyGuessedLetter = null;
      if (isLetterGuess && gameState.guessedLetters && newState.guessedLetters) {
        const newLetters = newState.guessedLetters.filter(
          letter => !gameState.guessedLetters.includes(letter)
        );
        if (newLetters.length > 0) {
          newlyGuessedLetter = newLetters[0];
        }
      }
      setGameState(prevState => ({
        ...prevState,
        ...newState
      }));
      setLoading(false);
      setGameStarted(true);
       // Show appropriate notification
      if (newlyGuessedLetter && newState.displayWord?.includes(newlyGuessedLetter)) {
        showNotification(`Good guess! "${newlyGuessedLetter}" is in the word.`);
      } else if (newlyGuessedLetter) {
        showNotification(`Sorry, "${newlyGuessedLetter}" is not in the word.`);
      }
      
    });
    
    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
      showNotification('Error: ' + error.message);
      setLoading(false);
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
  const startNewGame = (difficulty) => {
    console.log('Starting new game with difficulty:', difficulty);
    setActiveDifficulty(difficulty);
    setLoading(true);
    setGameStarted(true);
    
    // Add animation class to game container when restarting
    const gameContainer = document.querySelector('.game-container');
    if (gameContainer) {
      gameContainer.classList.remove('fadeInUp');
      void gameContainer.offsetWidth; // Trigger reflow to restart animation
      gameContainer.classList.add('fadeInUp');
    }
    
    if (connected) {
      socket.emit('startGame', difficulty);
      showNotification(`Loading ${difficulty} difficulty game...`);
    }
    else {
      setLoading(false);
      setGameStarted(false);
      showNotification('Error: Not connected to server.');
    }
  };
  const handleReconnect = () => {
    if(!socket.connected) {
      socket.connect();
      showNotification('Reconnecting to server...');
    }
  };

  return (
    <div className="game-container">
      <h1 className="game-title">Hangman Game</h1>

       {/* Show connection status when not connected or when game is over */}
       {(!connected || gameState.gameOver) && (
        <ConnectionStatus 
          showControls={true}
          onGameStart={startNewGame}
          isSinglePlayer={true}
        />
      )}

      {/* Initial welcome message when no game is started */}
      {!gameStarted && connected && !loading && (
        <div className="welcome-message">
          <h2>Welcome to Hangman!</h2>
          <p>Select a difficulty level below to start playing.</p>
        </div>
      )}
      
      {loading && connected ? (
        <div className="loading-container">
          <p>Loading word...</p>
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <>
           {gameStarted && (
              <>
                <div className='game-main-content'>
                  <Hangman attemptsLeft={gameState.attemptsLeft} />
                  {/* Box style for desktop */}
                  <GuessedLetters 
                    guessedLetters={gameState.guessedLetters} 
                    className="desktop-guessed-letters"
                    displayStyle="box"
                  />
                </div>
                <WordDisplay displayWord={gameState.displayWord} />
                {/* Line style for mobile */}
                {gameStarted && (
                  <GuessedLetters
                    guessedLetters={gameState.guessedLetters}
                    className="mobile-guessed-letters"
                    displayStyle="line"
                  />
                )}
              </>
            )}
        </>
      )}
      
      <div className="difficulty-controls">
        <button 
          className={`difficulty-easy ${activeDifficulty === 'easy' ? 'active' : ''}`}
          onClick={() => startNewGame('easy')}>
          Easy
        </button>
        <button 
          className={`difficulty-medium ${activeDifficulty === 'medium' ? 'active' : ''}`}
          onClick={() => startNewGame('medium')}>
          Medium
        </button>
        <button 
          className={`difficulty-hard ${activeDifficulty === 'hard' ? 'active' : ''}`}
          onClick={() => startNewGame('hard')}>
          Hard
        </button>
        <button 
          className={`difficulty-expert ${activeDifficulty === 'expert' ? 'active' : ''}`}
          onClick={() => startNewGame('expert')}>
          Expert
        </button>
      </div>
      
      <Keyboard 
        guessedLetters={gameState.guessedLetters}
        onLetterClick={handleLetterGuess}
        disabled={gameState.gameOver || !connected || loading || !gameStarted}
        gameState={gameState}
      />
      
      {gameStarted && (
        <GameOverModal
          isWon={gameState.won}
          word={gameState.word}
          onPlayAgain={() => startNewGame(gameState.difficulty)}
          isVisible={gameState.gameOver}
        />
      )}
      
      {!connected && (
        <div className="connection-error">
          <p>Connecting to server...</p>
          <button className="reconnect-button" onClick={handleReconnect}>
            Reconnect
          </button>
        </div>
      )}

      <div className="game-footer">
        <button className="button-secondary" onClick={onReturn}>
          Back to Main Menu
        </button>
      </div>
      
      {notification && (
        <div className="notification">{notification}</div>
      )}
    </div>
  );
}

export default Game;
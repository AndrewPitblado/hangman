import { useState, useEffect } from 'react';
import Hangman from './Hangman';
import WordDisplay from './WordDisplay';
import Keyboard from './Keyboard';
import GameOverModal from './GameOverModal';

function Game() {
  // Game state
  const [gameState, setGameState] = useState({
    word: '',          // Current word to guess (hidden)
    displayWord: '',   // Word with blanks for display (e.g. "a _ _ l e")
    guessedLetters: [], // Letters already guessed
    attemptsLeft: 6,   // Number of attempts remaining
    gameOver: false,   // Is the game over?
    won: false         // Did the player win?
  });
  
  // Store the word globally so the Keyboard component can access it
  // This is a quick hack - a better solution would be to pass correct/wrong guesses as props
  useEffect(() => {
    window.gameWord = gameState.word;
  }, [gameState.word]);

  // Function to handle letter guesses
  const handleLetterGuess = (letter) => {
    if (gameState.gameOver || gameState.guessedLetters.includes(letter)) {
      return; // Do nothing if game is over or letter already guessed
    }
    
    // In a real implementation, this would call your WebSocket service
    console.log(`Letter guessed: ${letter}`);
    
    // Placeholder logic for testing (replace with WebSocket calls later)
    const newGuessedLetters = [...gameState.guessedLetters, letter];
    let newAttemptsLeft = gameState.attemptsLeft;
    
    // Check if letter is in word (placeholder logic)
    if (!gameState.word.includes(letter)) {
      newAttemptsLeft -= 1;
    }
    
    // Check for win condition - placeholder logic
    let wordGuessed = false;
    if (gameState.word) {
      wordGuessed = [...gameState.word].every(letter => newGuessedLetters.includes(letter));
    }
    // Calculate the new display word
    const newDisplayWord = gameState.word
      .split('')
      .map(letter => newGuessedLetters.includes(letter) ? letter : '_')
      .join(' ');

    setGameState({
      ...gameState,
      displayWord: newDisplayWord,
      guessedLetters: newGuessedLetters,
      attemptsLeft: newAttemptsLeft,
      gameOver: newAttemptsLeft <= 0 || wordGuessed,
      won: wordGuessed
    });
  };

  // Start a new game
  const startNewGame = () => {
    // In real implementation, this would call your WebSocket service
    console.log('Starting new game');
    
    // Add animation class to game container when restarting
    const gameContainer = document.querySelector('.game-container');
    if (gameContainer) {
      gameContainer.classList.remove('fadeInUp');
      void gameContainer.offsetWidth; // Trigger reflow to restart animation
      gameContainer.classList.add('fadeInUp');
    }
    
    // Placeholder data (replace with WebSocket call)
    setGameState({
      word: 'apple',
      displayWord: '_ _ _ _ _',
      guessedLetters: [],
      attemptsLeft: 6,
      gameOver: false,
      won: false
    });
  };

  // Initialize game on component mount
  useEffect(() => {
    startNewGame();
  }, []);

  return (
    <div className="game-container">
      <h1 className="game-title">Hangman Game</h1>
      
      <Hangman attemptsLeft={gameState.attemptsLeft} />
      
      <WordDisplay 
        displayWord={gameState.displayWord} 
      />
      
      <Keyboard 
        guessedLetters={gameState.guessedLetters}
        onLetterClick={handleLetterGuess}
        disabled={gameState.gameOver}
      />
      
      <GameOverModal
        isWon={gameState.won}
        word={gameState.word}
        onPlayAgain={startNewGame}
        isVisible={gameState.gameOver}
      />
    </div>
  );
}

export default Game;
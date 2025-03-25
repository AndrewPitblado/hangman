import React from 'react';

function GameOverModal({ isWon, word, onPlayAgain, isVisible }) {
  if (!isVisible) return null;
  
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{isWon ? 'You Won! 🎉' : 'Game Over'}</h2>
        <p>{isWon 
          ? `Congratulations! You correctly guessed "${word}"` 
          : `The word was "${word}". Better luck next time!`}
        </p>
        <button className="play-again-btn" onClick={onPlayAgain}>
          Play Again
        </button>
      </div>
    </div>
  );
}

export default GameOverModal;
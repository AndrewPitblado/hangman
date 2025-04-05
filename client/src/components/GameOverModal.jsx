import { useState, useEffect } from 'react';
import {useNavigate} from 'react-router-dom';
import '../styles/components/modal.css'; // Adjust the path to your CSS file

function GameOverModal({ isWon, word, onPlayAgain, isVisible }) {
  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const navigate = useNavigate();
  
  // Handle visibility changes
  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      setIsClosing(false);
    } else if (shouldRender) {
      // Start close animation
      setIsClosing(true);
      // Remove from DOM after animation completes
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300); // Match this timing with your CSS animation duration
      
      return () => clearTimeout(timer);
    }
  }, [isVisible]);
  
  // Handle play again with animation
  const handlePlayAgain = () => {
    setIsClosing(true);
    setTimeout(() => {
      onPlayAgain();
    }, 300); // Match with animation duration
  };
  
  // Don't render anything if not visible and not animating
  if (!shouldRender) return null;
  
  return (
    <div className={`modal-overlay ${isClosing ? 'closing' : ''}`}>
      <div className={`modal-content ${isClosing ? 'closing' : ''}`}>
        <h2>{isWon ? 'You Won! 🎉' : 'Game Over'}</h2>
        <p>{isWon 
          ? `Congratulations! You correctly guessed "${word}"` 
          : `The word was "${word}". Better luck next time!`}
        </p>
        <div className='button-group'>
        <button className="play-again-btn" onClick={handlePlayAgain}>
          Play Again
        </button>
        <button className="menu-btn" onClick={() => navigate('/')}>
          Main Menu
        </button>
        </div>
      </div>
    </div>
  );
}

export default GameOverModal;
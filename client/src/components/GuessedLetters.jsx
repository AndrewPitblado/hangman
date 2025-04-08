import React from 'react';

function GuessedLetters({ guessedLetters, className, displayStyle = 'box' }) {
  // Sort letters alphabetically for easier reading
  const sortedLetters = [...(guessedLetters || [])].sort();
  
  return (
    <div className={`guessed-letters-container ${className || ''} ${displayStyle}-style`}>
      <h3>Guessed Letters</h3>
      
      {displayStyle === 'line' ? (
        // Line style layout
        <div className="guessed-letters-line">
          {sortedLetters.length > 0 ? (
            sortedLetters.map((letter, index) => (
              <span key={index} className="guessed-letter">
                {letter.toUpperCase()}
              </span>
            ))
          ) : (
            <span className="no-guesses">No letters guessed yet</span>
          )}
        </div>
      ) : (
        // Box style layout (default)
        <div className="guessed-letters-grid">
          {sortedLetters.length > 0 ? (
            <div className="guessed-letters-row">
              {sortedLetters.map((letter, index) => (
                <span key={index} className="guessed-letter">
                  {letter.toUpperCase()}
                </span>
              ))}
            </div>
          ) : (
            <span className="no-guesses">No letters guessed yet</span>
          )}
        </div>
      )}
    </div>
  );
}

export default GuessedLetters;
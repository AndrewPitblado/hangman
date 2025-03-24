function Keyboard({ guessedLetters, onLetterClick, disabled }) {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
    
    return (
      <div className="keyboard">
        {alphabet.map((letter) => (
          <button
            key={letter}
            onClick={() => onLetterClick(letter)}
            disabled={disabled || guessedLetters.includes(letter)}
            className={guessedLetters.includes(letter) ? 'guessed' : ''}
          >
            {letter}
          </button>
        ))}
      </div>
    );
  }
  
  export default Keyboard;
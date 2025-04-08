function Keyboard({ guessedLetters, onLetterClick, disabled, gameState }) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
  
  // This will be passed from Game.jsx
  const correctGuesses = alphabet.filter(letter => 
    guessedLetters.includes(letter) && (gameState?.displayWord?.includes(letter) || gameState?.word?.includes(letter))
  );
  
  const wrongGuesses = alphabet.filter(letter => 
    guessedLetters.includes(letter) && !(gameState?.displayWord?.includes(letter) || gameState?.word?.includes(letter))
  );
  
  return (
    <div className="keyboard">
      {alphabet.map((letter) => {
        // Determine button class based on guess status
        let buttonClass = '';
        if (correctGuesses.includes(letter)) buttonClass = 'correct-guess';
        if (wrongGuesses.includes(letter)) buttonClass = 'wrong-guess';
        if (guessedLetters.includes(letter)) buttonClass += ' guessed';
        
        return (
          <button
            key={letter}
            onClick={() => onLetterClick(letter)}
            disabled={disabled || guessedLetters.includes(letter)}
            className={buttonClass}
          >
            {letter}
          </button>
        );
      })}
    </div>
  );
}

export default Keyboard;
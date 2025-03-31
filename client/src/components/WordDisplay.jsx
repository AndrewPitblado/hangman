function WordDisplay({ displayWord }) {
  // Splitting the displayWord by spaces to get individual letters/blanks
  const letters = displayWord.split(' ');
  
  return (
    <div className="word-display">
      <div className="word-container">
        {letters.map((letter, index) => (
          <div 
            key={index} 
            className={`letter-box ${letter !== '_' ? 'revealed-letter' : ''}`}
          >
            {letter !== '_' ? letter : ''}
          </div>
        ))}
      </div>
    </div>
  );
}

export default WordDisplay;
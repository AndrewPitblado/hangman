import { useState, useEffect } from 'react';
import Game from './components/Game';
import GameInterface from './components/GameInterface';
import { ThemeProvider, useTheme } from './styles/ThemeContext';
import { clearCurrentGame } from './services/socket_service'; // Adjust import to your setup

import './App.css';

function App() {
  const [gameMode, setGameMode] = useState('menu'); // 'menu', 'singleplayer', 'multiplayer'
  
  // Handle return to main menu
  const handleReturn = () => {
    clearCurrentGame();
    setGameMode('menu');
  };

  return (
    <ThemeProvider>
      <ThemedApp gameMode={gameMode} setGameMode={setGameMode} handleReturn={handleReturn} />
    </ThemeProvider>
  );
}

// Theme-aware wrapper component
function ThemedApp({ gameMode, setGameMode, handleReturn }) {
  const { isDarkMode, toggleTheme } = useTheme();
  
  // Apply theme class to body
  useEffect(() => {
    document.body.classList.toggle('dark-theme', isDarkMode);
  }, [isDarkMode]);

  return (
    <>
      <div className="theme-toggle-container">
        <div className="theme-toggle">
          <button onClick={toggleTheme}>
            {isDarkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
          <span className="theme-status">
            Using {isDarkMode ? 'dark' : 'light'} theme (auto-detected)
          </span>
        </div>
      </div>
      <div className={`App ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
        {gameMode === 'menu' && (
          <div className="game-menu">
            <h1>Hangman</h1>
            <h2>Choose Game Mode</h2>
            <div className="menu-buttons">
              <button onClick={() => setGameMode('singleplayer')}>Single Player</button>
              <button onClick={() => setGameMode('multiplayer')}>Multiplayer</button>
            </div>
          </div>
        )}

        {gameMode === 'singleplayer' && (
          <Game onReturn={handleReturn} />
        )}

        {gameMode === 'multiplayer' && (
          <GameInterface onReturn={handleReturn} />
        )}
      </div>
    </>
  );
}

export default App;
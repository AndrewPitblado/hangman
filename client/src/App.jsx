import { useState, useEffect } from 'react';
import {Routes, Route} from 'react-router-dom';
import { Navigate, useNavigate } from 'react-router-dom';
import Game from './components/Game';
import GameInterface from './components/GameInterface';
import ConnectionStatus from './components/connectionStatus';
import { ThemeProvider, useTheme } from './styles/ThemeContext';
import { clearCurrentGame } from './services/socket_service'; // Adjust import to your setup

import './App.css';

function App() {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
}

// Theme-aware wrapper component
function ThemedApp() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [gameMode, setGameMode] = useState('menu'); // 'menu', 'singleplayer', 'multiplayer'
  const navigate = useNavigate();
  // Handle return to main menu
  const handleReturn = () => {
    clearCurrentGame();
    setGameMode('menu');
    navigate('/');
  };
  // Apply theme class to body
  useEffect(() => {
    document.body.classList.toggle('dark-theme', isDarkMode);
  }, [isDarkMode]);

  return (
    <div className='app-wrapper'>
      <div className="theme-toggle-container">
        
          <button className='theme-button' onClick={toggleTheme}>
            {isDarkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
          <span className="theme-status">
            Using {isDarkMode ? 'dark' : 'light'} theme (auto-detected)
          </span>
        
      </div>
      <div className={`App ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
        <Routes>
          <Route path="/" element={
            <div className="game-menu">
              <h1>Hangman</h1>
              <h2>Choose Game Mode</h2>
              <ConnectionStatus />
              <div className="menu-buttons">
                <button 
                className='menu-option-btn singleplayer-btn'
                onClick={() => {
                  setGameMode('singleplayer');
                  navigate('/singleplayer');
                }}>
                  Single Player
                </button>
                <button 
                className='menu-option-btn multiplayer-btn'
                onClick={() => {
                  setGameMode('multiplayer');
                  navigate('/multiplayer');
                }}>
                  Multiplayer
                </button>
              </div>
            </div>
          } />
          <Route path="/singleplayer" element={<Game onReturn={handleReturn} />} />
          <Route path="/multiplayer" element={<GameInterface onReturn={handleReturn} />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
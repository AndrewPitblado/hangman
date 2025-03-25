import { useState, useEffect } from 'react';
import Game from './components/Game';
import { ThemeProvider, useTheme } from './styles/ThemeContext';
import './App.css';


// Theme-aware wrapper component
function ThemedApp() {
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
        <Game />
      </div>
    </>
  );
}


function App() {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
}

export default App;
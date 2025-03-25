import { createContext, useContext, useEffect, useState } from 'react';

// Create context
const ThemeContext = createContext();

// Theme provider component
export function ThemeProvider({ children }) {
  // Check system preference
  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // State to track the current theme
  const [isDarkMode, setIsDarkMode] = useState(prefersDarkMode);
  
  // Listen for changes in system preferences
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Initial setup
    setIsDarkMode(mediaQuery.matches);
    
    // Add listener for changes
    const handler = (e) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handler);
    
    // Clean up
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  // Toggle theme manually (optional, for user override)
  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };
  
  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use theme
export const useTheme = () => useContext(ThemeContext);
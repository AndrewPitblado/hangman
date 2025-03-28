import { useState, useEffect } from 'react';
import { useTheme } from '../styles/ThemeContext';

function Hangman({ attemptsLeft }) {
  const { isDarkMode } = useTheme();
  // Body parts to be shown based on attempts left
  const bodyParts = [
    '',                              // 6 attempts left - nothing shown
    '💀',                           // 5 attempts left - head
    '💀\n|',                        // 4 attempts left - head and torso
    '💀\n/|',                       // 3 attempts left - head, torso, left arm
    '💀\n/|\\',                      // 2 attempts left - head, torso, both arms
    '💀\n/|\\\n/',                   // 1 attempt left - head, torso, arms, left leg
    '💀\n/|\\\n/ \\'                 // 0 attempts left - full body
  ];

  const currentStage = 6 - attemptsLeft;

  return (
    <div className="hangman-display">
      {/* SVG Stand */}
      <svg className="hangman-stand" width="200" height="250" viewBox="0 0 200 250">
        {/* Base */}
        <line x1="20" y1="230" x2="180" y2="230" stroke="var(--hangman-stand)" strokeWidth="10" strokeLinecap="round" />
        
        {/* Vertical pole */}
        <line x1="60" y1="30" x2="60" y2="230" stroke="var(--hangman-stand)" strokeWidth="8" strokeLinecap="round" />
        
        {/* Top bar */}
        <line x1="60" y1="30" x2="140" y2="30" stroke="var(--hangman-stand)" strokeWidth="8" strokeLinecap="round" />
        
        {/* Noose */}
        <line x1="140" y1="30" x2="140" y2="50" stroke="var(--hangman-stand)" strokeWidth="4" strokeLinecap="round" />

        {/* Show person parts based on attempts left */}
        {currentStage > 0 && ( // Head
          <text x="140" y="70" fontSize="30" textAnchor="middle" dominantBaseline="middle" fill="var(--hangman-body)">
            💀
          </text>
        )}
        
        {currentStage >= 2 && ( // Body
          <line x1="140" y1="80" x2="140" y2="130" stroke="var(--hangman-body)" strokeWidth="2" />
        )}
        
        {currentStage >= 3 && ( // Left arm
          <line x1="140" y1="95" x2="120" y2="115" stroke="var(--hangman-body)" strokeWidth="2" />
        )}
        
        {currentStage >= 4 && ( // Right arm
          <line x1="140" y1="95" x2="160" y2="115" stroke="var(--hangman-body)" strokeWidth="2" />
        )}
        
        {currentStage >= 5 && ( // Left leg
          <line x1="140" y1="130" x2="120" y2="170" stroke="var(--hangman-body)" strokeWidth="2" />
        )}
        
        {currentStage >= 6 && ( // Right leg
          <line x1="140" y1="130" x2="160" y2="170" stroke="var(--hangman-body)" strokeWidth="2" />
        )}
      </svg>

      <p className="attempts-counter">Attempts left: {attemptsLeft}</p>
    </div>
  );
}

export default Hangman;
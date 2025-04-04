const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors');
const wordLists = require('./words');

const app = express();
// Use the cors middleware
const allowedOrigins = [
  'https://classy-marshmallow-6be967.netlify.app',
  'http://localhost:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST"],
  credentials: true,
  allowedHeaders: ["Content-Type"]
}));

const server = http.createServer(app);

// Socket.IO with more explicit CORS
const io = new Server(server, {
    path: '/socket',
    cors: {
      origin: ['https://classy-marshmallow-6be967.netlify.app', 'http://localhost:5173'],
      methods: ["GET", "POST"],
      credentials: true,
      allowedHeaders: ["Content-Type"]
    }
  });
// Add route handlers
app.get('/', (req, res) => {
  res.send('Hangman WebSocket Server is running!'); // Simple text response
});

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.get('/test-cors', (req, res) => {
    // Set headers manually
    res.header('Access-Control-Allow-Origin', 'https://classy-marshmallow-6be967.netlify.app');
    res.header('Access-Control-Allow-Methods', 'GET, POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Log request information
    console.log('CORS test request received from origin:', req.headers.origin);
    console.log('Response headers:', res.getHeaders());
    
    res.send('CORS test successful!');
  });

// Store active games
const games = {};

// Get a random word based on difficulty
function getRandomWord(difficulty = 'medium') {
  const words = wordLists[difficulty] || wordLists.medium;
  return words[Math.floor(Math.random() * words.length)];
}

// WebSocket connection handler
io.on('connection', (socket) => {
  console.log('A user connected', socket.id);

  // Handle new game request
  socket.on('startGame', (difficulty = 'medium') => {
    const gameId = `game-${socket.id}`;
    const word = getRandomWord(difficulty);

    console.log(`New game started with word: ${word} (${difficulty} difficulty)`);

    // Create game state
    games[gameId] = {
      word: word,
      displayWord: '_ '.repeat(word.length).trim(),
      guessedLetters: [],
      attemptsLeft: 6,
      gameOver: false,
      won: false,
      difficulty: difficulty
    };

    socket.gameId = gameId;

    // Send initial game state (without revealing the actual word)
    socket.emit('gameState', {
      displayWord: games[gameId].displayWord,
      guessedLetters: games[gameId].guessedLetters,
      attemptsLeft: games[gameId].attemptsLeft,
      gameOver: games[gameId].gameOver,
      won: games[gameId].won,
      difficulty: difficulty
    });
  });

  // Handle letter guess
  socket.on('guessLetter', (letter) => {
    const gameId = socket.gameId;
    if (!gameId || !games[gameId]) {
      socket.emit('error', { message: 'No active game found' });
      return;
    }

    const game = games[gameId];

    // Validate and sanitize the guess
    if (game.gameOver || !letter || game.guessedLetters.includes(letter)) {
      return;
    }

    letter = letter.toLowerCase();

    // Add letter to guessed letters
    game.guessedLetters.push(letter);

    // Check if letter is in word
    if (!game.word.includes(letter)) {
      game.attemptsLeft -= 1;
    }

    // Update display word
    game.displayWord = game.word
      .split('')
      .map(char => game.guessedLetters.includes(char) ? char : '_')
      .join(' ');

    // Check win/lose condition
    const won = !game.displayWord.includes('_');
    game.gameOver = game.attemptsLeft <= 0 || won;
    game.won = won;

    // Send updated game state
    socket.emit('gameState', {
      displayWord: game.displayWord,
      guessedLetters: game.guessedLetters,
      attemptsLeft: game.attemptsLeft,
      gameOver: game.gameOver,
      won: game.won,
      word: game.gameOver ? game.word : undefined // Only send word if game is over
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected', socket.id);
    // Clean up any games associated with this socket
    const gameId = socket.gameId;
    if (gameId && games[gameId]) {
      delete games[gameId];
    }
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
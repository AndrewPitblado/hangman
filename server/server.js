const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors');
const wordLists = require('./words');
const { start } = require('repl');

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
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
      allowedHeaders: ["Content-Type"]
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 30000,
    pingInterval: 10000,
    maxHttpBufferSize: 1e6 // 1MB
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

  // Add this to your server.js to test server-to-client emits
app.get('/test-emit/:socketId', (req, res) => {
  const socketId = req.params.socketId;
  
  
  if (!socket) {
    return res.status(404).json({ error: 'Socket not found' });
  }
  
});

// Store active games

const games = new Map();

// Clean up old/inactive games periodically
const cleanupInterval = setInterval(() => {
  try {
    let gamesRemoved = 0;
    
    // Find games without any active connections
    for (const [gameId, game] of games.entries()) {
      if (!game.lastActivity || Date.now() - game.lastActivity > 3600000) { // 1 hour
        games.delete(gameId);
        gamesRemoved++;
      }
    }
    
    if (gamesRemoved > 0) {
      console.log(`Cleanup: removed ${gamesRemoved} inactive games`);
    }
  } catch (error) {
    console.error('Error in cleanup interval:', error);
  }
}, 900000); // 15 minutes

// Cleanup interval on server shutdown
process.on('SIGINT', () => {
  clearInterval(cleanupInterval);
  process.exit(0);
});

// Get a random word based on difficulty
function getRandomWord(difficulty = 'medium') {
  const words = wordLists[difficulty] || wordLists.medium;
  return words[Math.floor(Math.random() * words.length)];
}

// WebSocket connection handler
io.on('connection', (socket) => {
  console.log('A user connected', socket.id);
  // Debug endpoint to test event registration
  socket.on('debug', (callback) => {
    console.log(`Debug request from ${socket.id}`);
    const registeredEvents = Array.from(socket._events).map(e => typeof e === 'string' ? e : 'anonymous');
    callback({
      id: socket.id,
      eventsRegistered: registeredEvents,
      rooms: Array.from(socket.rooms),
      serverTime: new Date().toISOString()
    });
  });
  // Update heartbeat
  // Add this to fix the heartbeat response
  socket.on('heartbeat', (ack) => {
    console.log(`Received heartbeat from ${socket.id}`);
    socket.emit('heartbeat-response');
    
    if(typeof ack === 'function') {
      ack();
    }
    // Update last activity timestamp for the game if user is in one
    const gameId = socket.gameId;
    if (gameId && games.has(gameId)) {
      const game = games.get(gameId);
      game.lastActivity = Date.now();
    }
  });
  // Track socket connection time
  socket.connectionTime = Date.now();

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
      difficulty: difficulty,
      startTime: Date.now()
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
      word: game.gameOver ? game.word : undefined // Only send word is over
    });
  });

  // MULTIPLATER FUNCTIONALITY

    // Create a new room
    socket.on('createGame', (username, callback) => {
      console.log(`Received createGame request from ${socket.id} with username: ${username}`);
      const gameId = Math.random().toString(36).substring(2, 8).toUpperCase();
        
      games.set(gameId, {
        host: { id: socket.id, username },
        players: [{ id: socket.id, username }],
        status: 'waiting', // waiting, playing, finished
        lastActivity: Date.now() // Important: add last activity timestamp
      });
      socket.join(gameId); // Join the socket.io room with the gameId
      socket.gameId = gameId;
          
      console.log(`Emitting gameCreated event for game ${gameId}`);
      socket.emit('gameCreated', { 
        gameId, 
        isHost: true, 
        players: [{ id: socket.id, username }] 
      });
      
      // Send acknowledgement if callback provided
      if (typeof callback === 'function') {
        callback({ success: true, gameId });
      }
          
      console.log(`Game ${gameId} created by ${username}`);
    });

     // Room Joining
     socket.on('joinGame', ({ gameId, username }) => {
      const game = games.get(gameId);
      
      if (!game) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }
      
      const newPlayer = { id: socket.id, username };
      game.players.push(newPlayer);
    
      // Join the Socket.io room with the gameId
      socket.join(gameId); // Add this line to make the socket join the room
      socket.gameId = gameId;
      
      // Notify the new player
      socket.emit('gameJoined', {
        gameId,
        isHost: false,
        players: game.players,
        status: game.status
      });
      
      // Notify other players in the game
      game.players.forEach(player => {
        if (player.id !== socket.id) {
          const playerSocket = io.sockets.sockets.get(player.id);
          if (playerSocket) {
            playerSocket.emit('playerJoined', newPlayer);
          }
        }
      });
      console.log(`${username} joined game ${gameId}`);
});

  // Handle disconnect
socket.on('disconnect', () => {
    console.log('User disconnected', socket.id);
    
  
    // Handle player leaving room
    const gameId = socket.gameId;
    if (gameId && games.has(gameId)) {
      const game = games.get(gameId);
      
      // Remove player from room
      const playerIndex = game.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        const leavingPlayer = game.players[playerIndex];
        game.players.splice(playerIndex, 1);
        
        // Check if room is now empty
        if (game.players.length === 0) {
          games.delete(gameId);
          console.log(`Game ${gameId} deleted - all players left`);
        } 
        // If the host left, assign a new host
        else if (game.host.id === socket.id && game.players.length > 0) {
          game.host = game.players[0];
          io.to(gameId).emit('hostChanged', game.host);
          console.log(`New host in game ${gameId}: ${game.host.username}`);
        } else {
          // Notify remaining players that someone left
          io.to(gameId).emit('playerLeft', socket.id);
        }
      }
    }
  });


  socket.on('startMultiplayerGame', ({ word, difficulty }) => {
    const gameId = socket.gameId;
    if (!gameId || !games.has(gameId)) {
      socket.emit('error', { message: 'No active game found' });
      return;
    }

    const game = games.get(gameId);

    if (game.host.id !== socket.id) {
        socket.emit('error', { message: 'Only the host can start the game' });
        return;
    }

    const gameWord = word || getRandomWord(difficulty);

        // Create game state for this room
    game.gameState = {
        word: gameWord.toLowerCase(),
        displayWord: '_ '.repeat(gameWord.length).trim(),
        guessedLetters: [],
        attemptsLeft: 6,
        gameOver: false,
        won: false
        };

        game.status = 'playing';

       // Notify all players except host
    game.players.forEach(player => {
      if (player.id !== game.host.id) {
        io.to(player.id).emit('gameStarted', {
          wordLength: gameWord.length,
          displayWord: game.gameState.displayWord,
          attemptsLeft: game.gameState.attemptsLeft,
          hostUsername: game.host.username
        });
      }
    });

       // Notify the host (with the word)
    io.to(game.host.id).emit('gameStarted', {
      word: gameWord,
      displayWord: game.gameState.displayWord,
      attemptsLeft: game.gameState.attemptsLeft,
      isHost: true
    });
        console.log(`Game started in game ${gameId} with word: ${gameWord}`);
    });

      
    // Handle letter guess in room
// Handle letter guess in room
socket.on('guessLetter', (letter) => {
  const gameId = socket.gameId;
  if (!gameId || !games.has(gameId)) {
    socket.emit('error', { message: 'No active game found' });
    return;
  }

  const game = games.get(gameId);
  
  // Check if gameState exists
  if (!game.gameState) {
    socket.emit('error', { message: 'Game has not started yet' });
    return;
  }

  // Prevent host from guessing 
  if(game.host.id === socket.id) {
      socket.emit('error', { message: 'Host cannot guess letters' });
      return;
  }

  // Validate and sanitize the guess
  if (game.gameState.gameOver || !letter || game.gameState.guessedLetters.includes(letter)) {
      return;
  }

  letter = letter.toLowerCase();

  // Who guessed the letter
  const guesser = game.players.find(player => player.id === socket.id);

  // Add letter to guessed letters 
  game.gameState.guessedLetters.push(letter);

  // Check if letter is in word
  if (!game.gameState.word.includes(letter)) {
      game.gameState.attemptsLeft -= 1;
  }
  
  // Update display word
  game.gameState.displayWord = game.gameState.word
      .split('')
      .map(char => game.gameState.guessedLetters.includes(char) ? char : '_')
      .join(' ');
      
  // Check win/lose condition
  const won = !game.gameState.displayWord.includes('_');
  game.gameState.gameOver = game.gameState.attemptsLeft <= 0 || won;
  game.gameState.won = won;

  if(game.gameState.gameOver) {
      game.status = 'finished';
  }

  // Broadcast the updated game state to all players - lowercase 'g' in gameStateUpdate to match client
  io.to(gameId).emit('gameStateUpdate', {
      displayWord: game.gameState.displayWord,
      guessedLetters: game.gameState.guessedLetters,
      attemptsLeft: game.gameState.attemptsLeft,
      gameOver: game.gameState.gameOver,
      won: game.gameState.won,
      word: game.gameState.gameOver ? game.gameState.word : undefined,
      guesser: guesser.username
  });
});

    // Play again (host only)
    socket.on('playAgain', () => {
        const gameId = socket.gameId;
        if (!gameId || !games.has(gameId)) {
            socket.emit('error', { message: 'No active game found' });
            return;
        }

        const game = games.get(gameId);
        if (game.host.id !== socket.id) {
            socket.emit('error', { message: 'Only the host can start a new game' });
            return;
        }

        // Reset game state
        game.gameState = null;
        game.status = 'waiting';

        // Notify all players
        io.to(gameId).emit('gameReset', {
            gameId,
            players: game.players
        });
    });

    // Handle rejoin attempts after reconnection
socket.on('rejoinGame', ({ gameId, username, isHost }) => {
    // Check if room exists
    if (!games.has(gameId)) {
      socket.emit('error', { message: 'Game no longer exists' });
      return;
    }
    
    const game = games.get(gameId);
    
    // Remove old socket instances for this user if any
    const existingPlayerIndex = game.players.findIndex(p => p.username === username);
    if (existingPlayerIndex !== -1) {
      game.players[existingPlayerIndex].id = socket.id;
    } else {
      // Add as a new player
      game.players.push({ id: socket.id, username });
    }
    
    // Rejoin the socket.io room
    socket.join(gameId);
    socket.gameId = gameId;
    
    // Update host if needed
    if (isHost && game.host.username === username) {
      game.host.id = socket.id;
    }
    
    // Send current room state back to the reconnected player
    socket.emit('gameJoined', {
      gameId,
      isHost: game.host.id === socket.id,
      players: game.players,
      status: game.status
    });
    
    // If game is in progress, send game state
    if (game.status === 'playing' && game.gameState) {
      const gameData = {
        displayWord: game.gameState.displayWord,
        guessedLetters: game.gameState.guessedLetters,
        attemptsLeft: game.gameState.attemptsLeft,
        gameOver: game.gameState.gameOver,
        won: game.gameState.won
      };
      
      // If host, include the word
      if (game.host.id === socket.id) {
        gameData.word = game.game.word;
        gameData.isHost = true;
      }
      
      socket.emit('gameStarted', gameData);
    }
    
    // Notify other players
    socket.to(gameId).emit('playerJoined', { id: socket.id, username });
    
    console.log(`${username} rejoined game ${gameId}`);
  });
  

});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  // Handle client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
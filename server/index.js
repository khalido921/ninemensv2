const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Serve static files from the React build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// Game state storage
const games = new Map();
const players = new Map();

// Game logic constants
const BOARD_POSITIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Outer square
  [9, 10, 11], [12, 13, 14], [15, 16, 17], // Middle square
  [18, 19, 20], [21, 22, 23] // Inner square
];

const MILL_COMBINATIONS = [
  // Horizontal mills
  [0, 1, 2], [3, 4, 5], [6, 7, 8], [9, 10, 11], [12, 13, 14], [15, 16, 17], [18, 19, 20], [21, 22, 23],
  // Vertical mills
  [0, 9, 21], [3, 10, 18], [6, 11, 15], [1, 4, 7], [16, 19, 22], [8, 12, 17], [5, 13, 20], [2, 14, 23]
];

const ADJACENT_POSITIONS = {
  0: [1, 9], 1: [0, 2, 4], 2: [1, 14], 3: [4, 10], 4: [1, 3, 5, 7], 5: [4, 13], 6: [7, 11], 7: [4, 6, 8],
  8: [7, 12], 9: [0, 10, 21], 10: [3, 9, 11, 18], 11: [6, 10, 15], 12: [8, 13, 17], 13: [5, 12, 14, 20],
  14: [2, 13, 23], 15: [11, 16], 16: [15, 17, 19], 17: [12, 16], 18: [10, 19], 19: [16, 18, 20, 22],
  20: [13, 19, 23], 21: [9, 22], 22: [19, 21, 23], 23: [14, 20, 22]
};

class Game {
  constructor(gameId, player1Id) {
    this.gameId = gameId;
    this.players = {
      [player1Id]: { id: player1Id, color: 'white', pieces: 9, unplaced: 9, inPlay: 0 }
    };
    this.board = new Array(24).fill(null);
    this.currentTurn = player1Id;
    this.phase = 'placement'; // 'placement', 'movement', 'flying'
    this.gameState = 'waiting'; // 'waiting', 'playing', 'finished'
    this.lastMove = null;
    this.millFormed = false;
    this.chat = [];
    this.createdAt = Date.now();
  }

  addPlayer(player2Id) {
    if (Object.keys(this.players).length < 2) {
      this.players[player2Id] = { id: player2Id, color: 'black', pieces: 9, unplaced: 9, inPlay: 0 };
      this.gameState = 'playing';
      return true;
    }
    return false;
  }

  isValidPlacement(position, playerId) {
    if (this.phase !== 'placement') return false;
    if (this.board[position] !== null) return false;
    if (this.players[playerId].unplaced <= 0) return false;
    return true;
  }

  isValidMove(from, to, playerId) {
    if (this.phase === 'placement') return false;
    if (this.board[from] !== playerId) return false;
    if (this.board[to] !== null) return false;

    const player = this.players[playerId];
    
    // Flying phase
    if (player.inPlay === 3) {
      return true;
    }
    
    // Normal movement phase
    return ADJACENT_POSITIONS[from] && ADJACENT_POSITIONS[from].includes(to);
  }

  placePiece(position, playerId) {
    if (!this.isValidPlacement(position, playerId)) return false;
    
    this.board[position] = playerId;
    this.players[playerId].unplaced--;
    this.players[playerId].inPlay++;
    this.lastMove = { type: 'placement', position, playerId };
    
    // Check for mill formation
    this.millFormed = this.checkMill(position, playerId);
    
    // Update phase if all pieces are placed
    if (this.players[playerId].unplaced === 0 && this.players[this.getOpponentId(playerId)].unplaced === 0) {
      this.phase = 'movement';
    }
    
    // Update phase to flying if player has only 3 pieces
    if (this.players[playerId].inPlay === 3) {
      this.phase = 'flying';
    }
    
    return true;
  }

  movePiece(from, to, playerId) {
    if (!this.isValidMove(from, to, playerId)) return false;
    
    this.board[from] = null;
    this.board[to] = playerId;
    this.lastMove = { type: 'movement', from, to, playerId };
    
    // Check for mill formation
    this.millFormed = this.checkMill(to, playerId);
    
    return true;
  }

  removePiece(position, playerId) {
    const opponentId = this.getOpponentId(playerId);
    if (this.board[position] !== opponentId) return false;
    
    // Check if piece is in a mill
    if (this.isInMill(position, opponentId)) {
      // Only allow removal if all opponent pieces are in mills
      const allOpponentPieces = this.board.map((player, pos) => player === opponentId ? pos : -1).filter(pos => pos !== -1);
      const allInMills = allOpponentPieces.every(pos => this.isInMill(pos, opponentId));
      if (!allInMills) return false;
    }
    
    this.board[position] = null;
    this.players[opponentId].inPlay--;
    this.lastMove = { type: 'removal', position, playerId };
    this.millFormed = false;
    
    return true;
  }

  checkMill(position, playerId) {
    return MILL_COMBINATIONS.some(combination => {
      if (!combination.includes(position)) return false;
      return combination.every(pos => this.board[pos] === playerId);
    });
  }

  isInMill(position, playerId) {
    return MILL_COMBINATIONS.some(combination => {
      if (!combination.includes(position)) return false;
      return combination.every(pos => this.board[pos] === playerId);
    });
  }

  getOpponentId(playerId) {
    return Object.keys(this.players).find(id => id !== playerId);
  }

  switchTurn() {
    if (!this.millFormed) {
      this.currentTurn = this.getOpponentId(this.currentTurn);
    }
  }

  checkWinCondition() {
    const playerIds = Object.keys(this.players);
    for (const playerId of playerIds) {
      const player = this.players[playerId];
      if (player.inPlay < 3) {
        return { winner: this.getOpponentId(playerId), reason: 'less_than_3_pieces' };
      }
      
      // Check if player has no legal moves
      if (this.phase !== 'placement' && !this.hasLegalMoves(playerId)) {
        return { winner: this.getOpponentId(playerId), reason: 'no_legal_moves' };
      }
    }
    return null;
  }

  hasLegalMoves(playerId) {
    const player = this.players[playerId];
    const playerPieces = this.board.map((player, index) => player === playerId ? index : -1).filter(index => index !== -1);
    
    if (player.inPlay === 3) {
      // Flying phase - can move to any empty position
      const emptyPositions = this.board.map((player, index) => player === null ? index : -1).filter(index => index !== -1);
      return emptyPositions.length > 0;
    }
    
    // Normal movement - check adjacent positions
    for (const piece of playerPieces) {
      const adjacent = ADJACENT_POSITIONS[piece] || [];
      for (const adj of adjacent) {
        if (this.board[adj] === null) {
          return true;
        }
      }
    }
    return false;
  }

  addChatMessage(playerId, message) {
    this.chat.push({
      id: uuidv4(),
      playerId,
      message,
      timestamp: Date.now()
    });
  }

  getGameState() {
    return {
      gameId: this.gameId,
      board: this.board,
      players: this.players,
      currentTurn: this.currentTurn,
      phase: this.phase,
      gameState: this.gameState,
      lastMove: this.lastMove,
      millFormed: this.millFormed,
      chat: this.chat
    };
  }
}

// Socket.io event handlers
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  players.set(socket.id, { id: socket.id, gameId: null });

  // Create a new game
  socket.on('createGame', (callback) => {
    const gameId = uuidv4();
    const game = new Game(gameId, socket.id);
    games.set(gameId, game);
    players.get(socket.id).gameId = gameId;
    
    socket.join(gameId);
    callback({ success: true, gameId, playerId: socket.id });
  });

  // Join an existing game
  socket.on('joinGame', ({ gameId }, callback) => {
    const game = games.get(gameId);
    if (!game) {
      callback({ success: false, error: 'Game not found' });
      return;
    }
    
    if (game.gameState !== 'waiting') {
      callback({ success: false, error: 'Game is full or already started' });
      return;
    }
    
    const success = game.addPlayer(socket.id);
    if (success) {
      players.get(socket.id).gameId = gameId;
      socket.join(gameId);
      
      // Notify both players that game is ready
      io.to(gameId).emit('gameStarted', game.getGameState());
      callback({ success: true, gameId, playerId: socket.id });
    } else {
      callback({ success: false, error: 'Game is full' });
    }
  });

  // Place a piece
  socket.on('placePiece', ({ position }, callback) => {
    const player = players.get(socket.id);
    if (!player || !player.gameId) {
      callback({ success: false, error: 'Not in a game' });
      return;
    }
    
    const game = games.get(player.gameId);
    if (!game || game.currentTurn !== socket.id) {
      callback({ success: false, error: 'Not your turn' });
      return;
    }
    
    const success = game.placePiece(position, socket.id);
    if (success) {
      const winCondition = game.checkWinCondition();
      if (winCondition) {
        game.gameState = 'finished';
        io.to(player.gameId).emit('gameEnded', { winner: winCondition.winner, reason: winCondition.reason });
      } else {
        game.switchTurn();
        io.to(player.gameId).emit('gameStateUpdated', game.getGameState());
      }
      callback({ success: true });
    } else {
      callback({ success: false, error: 'Invalid placement' });
    }
  });

  // Move a piece
  socket.on('movePiece', ({ from, to }, callback) => {
    const player = players.get(socket.id);
    if (!player || !player.gameId) {
      callback({ success: false, error: 'Not in a game' });
      return;
    }
    
    const game = games.get(player.gameId);
    if (!game || game.currentTurn !== socket.id) {
      callback({ success: false, error: 'Not your turn' });
      return;
    }
    
    const success = game.movePiece(from, to, socket.id);
    if (success) {
      const winCondition = game.checkWinCondition();
      if (winCondition) {
        game.gameState = 'finished';
        io.to(player.gameId).emit('gameEnded', { winner: winCondition.winner, reason: winCondition.reason });
      } else {
        game.switchTurn();
        io.to(player.gameId).emit('gameStateUpdated', game.getGameState());
      }
      callback({ success: true });
    } else {
      callback({ success: false, error: 'Invalid move' });
    }
  });

  // Remove opponent's piece (after forming a mill)
  socket.on('removePiece', ({ position }, callback) => {
    const player = players.get(socket.id);
    if (!player || !player.gameId) {
      callback({ success: false, error: 'Not in a game' });
      return;
    }
    
    const game = games.get(player.gameId);
    if (!game || game.currentTurn !== socket.id || !game.millFormed) {
      callback({ success: false, error: 'Cannot remove piece' });
      return;
    }
    
    const success = game.removePiece(position, socket.id);
    if (success) {
      const winCondition = game.checkWinCondition();
      if (winCondition) {
        game.gameState = 'finished';
        io.to(player.gameId).emit('gameEnded', { winner: winCondition.winner, reason: winCondition.reason });
      } else {
        game.switchTurn();
        io.to(player.gameId).emit('gameStateUpdated', game.getGameState());
      }
      callback({ success: true });
    } else {
      callback({ success: false, error: 'Invalid removal' });
    }
  });

  // Send chat message
  socket.on('sendMessage', ({ message }, callback) => {
    const player = players.get(socket.id);
    if (!player || !player.gameId) {
      callback({ success: false, error: 'Not in a game' });
      return;
    }
    
    const game = games.get(player.gameId);
    if (!game) {
      callback({ success: false, error: 'Game not found' });
      return;
    }
    
    // Rate limiting: max 1 message per second
    const lastMessage = game.chat[game.chat.length - 1];
    if (lastMessage && lastMessage.playerId === socket.id && Date.now() - lastMessage.timestamp < 1000) {
      callback({ success: false, error: 'Message rate limit exceeded' });
      return;
    }
    
    game.addChatMessage(socket.id, message);
    io.to(player.gameId).emit('newMessage', game.chat[game.chat.length - 1]);
    callback({ success: true });
  });

  // Get current game state
  socket.on('getGameState', (callback) => {
    const player = players.get(socket.id);
    if (!player || !player.gameId) {
      callback({ success: false, error: 'Not in a game' });
      return;
    }
    
    const game = games.get(player.gameId);
    if (!game) {
      callback({ success: false, error: 'Game not found' });
      return;
    }
    
    callback({ success: true, gameState: game.getGameState() });
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    const player = players.get(socket.id);
    if (player && player.gameId) {
      const game = games.get(player.gameId);
      if (game) {
        io.to(player.gameId).emit('playerDisconnected', { playerId: socket.id });
      }
    }
    players.delete(socket.id);
  });
});

// Clean up old games (older than 24 hours)
setInterval(() => {
  const now = Date.now();
  for (const [gameId, game] of games.entries()) {
    if (now - game.createdAt > 24 * 60 * 60 * 1000) {
      games.delete(gameId);
    }
  }
}, 60 * 60 * 1000); // Run every hour

// Serve React app for all non-API routes
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
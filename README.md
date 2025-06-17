# Nine Men's Morris - Multiplayer Game

A complete web-based implementation of the classic board game "Nine Men's Morris" with real-time multiplayer support over the internet.

## 🎮 Features

### Core Game Logic
- **Full Nine Men's Morris Rules**: Complete implementation of all game phases
  - Phase 1: Piece placement (9 pieces per player)
  - Phase 2: Moving pieces to adjacent positions
  - Phase 3: Flying (when player has only 3 pieces)
- **Mill Detection**: Automatic detection of 3-in-a-row formations
- **Piece Removal**: Remove opponent pieces after forming mills
- **Win Conditions**: Win by reducing opponent to <3 pieces or blocking all moves

### Multiplayer Functionality
- **Real-time 2-player support** via WebSockets
- **Room-based gameplay** with unique game IDs
- **Turn-based interaction** with server-side rule enforcement
- **Player assignment** (White/Black pieces)

### User Interface
- **Modern, responsive design** using React and Tailwind CSS
- **Interactive game board** with visual feedback
- **Real-time turn indicators** and game state updates
- **Mobile-friendly** responsive layout

### Game Feedback & Sound
- **Sound effects** for key game events:
  - Mill formation sound
  - Turn switching notification
  - Chat message alerts
  - Victory fanfare
- **Visual highlights** for valid moves, selected pieces, and formed mills

### Chat System
- **Real-time chat** between players
- **Emoji picker** with 20+ emojis
- **Message timestamps**
- **Rate limiting** (1 message per second)
- **Auto-scroll** with manual scroll detection
- **Sound notifications** for new messages

### Game Flow
- **Entry Screen**: Create or join games with room codes
- **Lobby**: Wait for opponent with game ID sharing
- **In-game UI**: Complete game interface with chat
- **End Game**: Winner announcement with replay options

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd nine-mens-morris
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Start the development servers**
   ```bash
   npm run dev
   ```

4. **Open the game**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001

### How to Play

1. **Create a Game**: Click "Create Game" and share the game ID with a friend
2. **Join a Game**: Enter the game ID provided by your friend
3. **Place Pieces**: Take turns placing your 9 pieces on the board
4. **Form Mills**: Create 3-in-a-row formations to remove opponent pieces
5. **Move Pieces**: After all pieces are placed, move them to adjacent positions
6. **Win**: Reduce your opponent to less than 3 pieces or block all their moves

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **Tailwind CSS** - Styling
- **Socket.io Client** - Real-time communication
- **Web Audio API** - Sound effects

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Socket.io** - Real-time WebSocket communication
- **UUID** - Unique identifier generation

## 📁 Project Structure

```
nine-mens-morris/
├── client/                 # React frontend
│   ├── public/            # Static files
│   │   ├── components/    # React components
│   │   ├── context/       # React context providers
│   │   └── index.js       # App entry point
│   └── package.json
├── server/                # Node.js backend
│   ├── index.js          # Server entry point
│   └── package.json
├── package.json           # Root package.json
└── README.md
```

## 🎯 Game Rules

### Setup
- Each player has 9 pieces
- White goes first
- Players take turns placing pieces on the board

### Placement Phase
- Place all 9 pieces on any empty intersection
- Form mills (3 pieces in a row) to remove opponent pieces
- After forming a mill, remove one opponent piece (not from another mill unless all pieces are in mills)

### Movement Phase
- After all pieces are placed, move pieces to adjacent empty positions
- Continue forming mills and removing pieces
- If a player has only 3 pieces, they can "fly" to any empty position

### Winning
- Reduce opponent to less than 3 pieces
- OR block all opponent's legal moves

## 🔧 Development

### Available Scripts

```bash
# Install all dependencies
npm run install-all

# Start both frontend and backend in development
npm run dev

# Start only the backend server
npm run server

# Start only the frontend client
npm run client

# Build the frontend for production
npm run build
```

### Environment Variables

Create a `.env` file in the root directory:
```env
PORT=3001
NODE_ENV=development
```

## 🚀 Deployment

### Heroku Deployment

1. **Create a Heroku app**
   ```bash
   heroku create your-app-name
   ```

2. **Set environment variables**
   ```bash
   heroku config:set NODE_ENV=production
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

### Vercel/Netlify Deployment

1. **Build the frontend**
   ```bash
   npm run build
   ```

2. **Deploy the `client/build` folder** to your preferred platform

3. **Deploy the backend** to a Node.js hosting service (Railway, Render, etc.)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Classic Nine Men's Morris game rules
- Socket.io for real-time communication
- React and Tailwind CSS communities
- Web Audio API for sound effects

## 📞 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/your-username/nine-mens-morris/issues) page
2. Create a new issue with detailed information
3. Include browser console logs and server logs if applicable

---

**Enjoy playing Nine Men's Morris! 🎮** 
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import EntryScreen from './components/EntryScreen';
import GameBoard from './components/GameBoard';
import Lobby from './components/Lobby';
import { GameProvider } from './context/GameContext';
import { SoundProvider } from './context/SoundContext';

const SOCKET_URL = process.env.NODE_ENV === 'production' 
  ? window.location.origin 
  : 'http://localhost:3001';

function App() {
  const [socket, setSocket] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('entry'); // 'entry', 'lobby', 'game'
  const [gameData, setGameData] = useState(null);
  const [playerId, setPlayerId] = useState(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const handleGameCreated = (gameId, playerId) => {
    setPlayerId(playerId);
    setGameData({ gameId, status: 'waiting' });
    setCurrentScreen('lobby');
  };

  const handleGameJoined = (gameId, playerId) => {
    setPlayerId(playerId);
    setGameData({ gameId, status: 'waiting' });
    setCurrentScreen('lobby');
  };

  const handleGameStarted = (gameState) => {
    setGameData({ ...gameData, ...gameState, status: 'playing' });
    setCurrentScreen('game');
  };

  const handleGameEnded = (result) => {
    setGameData({ ...gameData, status: 'finished', result });
  };

  const handleReturnToLobby = () => {
    setCurrentScreen('lobby');
  };

  const handleReturnToEntry = () => {
    setCurrentScreen('entry');
    setGameData(null);
    setPlayerId(null);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'entry':
        return (
          <EntryScreen
            socket={socket}
            onGameCreated={handleGameCreated}
            onGameJoined={handleGameJoined}
          />
        );
      case 'lobby':
        return (
          <Lobby
            socket={socket}
            gameData={gameData}
            playerId={playerId}
            onGameStarted={handleGameStarted}
            onReturnToEntry={handleReturnToEntry}
          />
        );
      case 'game':
        return (
          <GameBoard
            socket={socket}
            gameData={gameData}
            playerId={playerId}
            onGameEnded={handleGameEnded}
            onReturnToLobby={handleReturnToLobby}
            onReturnToEntry={handleReturnToEntry}
          />
        );
      default:
        return <EntryScreen socket={socket} onGameCreated={handleGameCreated} onGameJoined={handleGameJoined} />;
    }
  };

  if (!socket) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Connecting to server...</div>
      </div>
    );
  }

  return (
    <SoundProvider>
      <GameProvider>
        <div className="App min-h-screen">
          {renderScreen()}
        </div>
      </GameProvider>
    </SoundProvider>
  );
}

export default App; 
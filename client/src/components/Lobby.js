import React, { useState, useEffect } from 'react';
import { useSound } from '../context/SoundContext';

const Lobby = ({ socket, gameData, playerId, onGameStarted, onReturnToEntry }) => {
  const [players, setPlayers] = useState([]);
  const [gameId, setGameId] = useState('');
  const [isHost, setIsHost] = useState(false);
  const { playSound } = useSound();

  useEffect(() => {
    if (gameData) {
      setGameId(gameData.gameId);
      // First player to join is the host
      setIsHost(Object.keys(gameData.players || {}).indexOf(playerId) === 0);
    }

    // Listen for game state updates
    socket.on('gameStarted', (gameState) => {
      playSound('turn');
      onGameStarted(gameState);
    });

    socket.on('gameStateUpdated', (gameState) => {
      setPlayers(Object.values(gameState.players || {}));
    });

    // Get initial game state
    socket.emit('getGameState', (response) => {
      if (response.success) {
        setPlayers(Object.values(response.gameState.players || {}));
      }
    });

    return () => {
      socket.off('gameStarted');
      socket.off('gameStateUpdated');
    };
  }, [socket, gameData, playerId, onGameStarted, playSound]);

  const copyGameId = () => {
    navigator.clipboard.writeText(gameId);
    playSound('message');
  };

  const handleLeaveGame = () => {
    socket.emit('leaveGame');
    onReturnToEntry();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Game Lobby</h1>
          <p className="text-gray-600">Waiting for players to join...</p>
        </div>

        {/* Game ID Section */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Game ID</h2>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={gameId}
              readOnly
              className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-mono"
            />
            <button
              onClick={copyGameId}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Copy
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Share this ID with your friend to join the game
          </p>
        </div>

        {/* Players List */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Players ({players.length}/2)</h2>
          <div className="space-y-3">
            {players.map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center p-3 rounded-lg border ${
                  player.id === playerId
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  player.color === 'white' ? 'bg-gray-300' : 'bg-gray-700'
                }`}></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">
                    {player.id === playerId ? 'You' : `Player ${index + 1}`}
                  </p>
                  <p className="text-sm text-gray-500">
                    {player.color === 'white' ? 'White pieces' : 'Black pieces'}
                  </p>
                </div>
                {player.id === playerId && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    You
                  </span>
                )}
              </div>
            ))}
            
            {/* Empty slots */}
            {Array.from({ length: 2 - players.length }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="flex items-center p-3 rounded-lg border border-dashed border-gray-300"
              >
                <div className="w-3 h-3 rounded-full mr-3 bg-gray-200"></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-400">Waiting for player...</p>
                  <p className="text-sm text-gray-400">Not connected</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Game Status */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></div>
            <p className="text-sm text-yellow-800">
              {players.length === 1 ? 'Waiting for opponent to join...' : 'Game will start automatically when both players are ready'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleLeaveGame}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            Leave Game
          </button>
        </div>

        {/* Game Rules Reminder */}
        <div className="mt-6 pt-6 border-t">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Game Rules:</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• White goes first</li>
            <li>• Place all 9 pieces before moving</li>
            <li>• Form mills to remove opponent pieces</li>
            <li>• Win by reducing opponent to 2 pieces</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Lobby; 